-- 공유 링크 저장 테이블. Supabase > SQL Editor 에 붙여 넣고 Run 한다.

-- 1) 공유된 결과 한 건 = 입력값 + AI 풀이 글
create table if not exists public.shared_readings (
  id text primary key,
  created_at timestamptz not null default now(),
  input jsonb not null,
  interpretation text not null
);

-- 2) 표 잠금(RLS). 정책을 하나도 만들지 않아 공개 키로는 표를 직접 읽거나 쓸 수 없다.
--    저장은 로컬의 비밀 키로만 한다(비밀 키는 RLS를 건너뛴다).
alter table public.shared_readings enable row level security;

-- 3) 링크 ID로 한 건만 꺼내는 함수. 공개 키로는 이 함수만 부를 수 있어 목록 전체는 볼 수 없다.
create or replace function public.get_shared_reading(reading_id text)
returns table (id text, created_at timestamptz, input jsonb, interpretation text)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.created_at, r.input, r.interpretation
  from public.shared_readings r
  where r.id = reading_id
$$;

revoke all on function public.get_shared_reading(text) from public;
grant execute on function public.get_shared_reading(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- AI 풀이 하루 사용 횟수(방문자별). 방문자는 IP를 서버 비밀값과 섞은 해시로만 저장한다.
create table if not exists public.ai_quota (
  visitor text not null,
  day date not null,
  used int not null default 0,
  primary key (visitor, day)
);
alter table public.ai_quota enable row level security;

-- 1회 차감. 차감 후 남은 횟수를 돌려주고, 이미 다 썼으면 -1.
create or replace function public.consume_ai_quota(visitor_id text, quota_day date, max_uses int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  used_now int;
begin
  insert into public.ai_quota as q (visitor, day, used)
  values (visitor_id, quota_day, 1)
  on conflict (visitor, day) do update set used = q.used + 1
  where q.used < max_uses
  returning q.used into used_now;
  if used_now is null then
    return -1;
  end if;
  return max_uses - used_now;
end
$$;

-- 풀이가 실패했을 때 1회 되돌리기
create or replace function public.refund_ai_quota(visitor_id text, quota_day date)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ai_quota set used = greatest(used - 1, 0)
  where visitor = visitor_id and day = quota_day
$$;

revoke all on function public.consume_ai_quota(text, date, int) from public;
revoke all on function public.refund_ai_quota(text, date) from public;
grant execute on function public.consume_ai_quota(text, date, int) to anon, authenticated;
grant execute on function public.refund_ai_quota(text, date) to anon, authenticated;
