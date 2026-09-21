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
