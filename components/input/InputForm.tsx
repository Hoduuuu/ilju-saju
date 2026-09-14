"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EMPTY_FORM, formToInput, inputToForm, type FormErrors, type FormValues } from "@/lib/input/form";
import { clearSaju, saveInput } from "@/lib/input/storage";
import { useStoredInput } from "@/lib/input/useStoredInput";
import { placesByProvince } from "@/lib/saju/places";

const PLACE_GROUPS = placesByProvince();
const inputClass =
  "h-11 w-full rounded-none border-0 border-b border-line bg-transparent px-1 text-[17px] font-semibold text-ink outline-none transition focus:border-ink disabled:text-sub";

function RadioPair<T extends string>(props: {
  ariaLabel: string;
  name: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  describedBy?: string;
}) {
  return (
    <div role="radiogroup" aria-label={props.ariaLabel} aria-describedby={props.describedBy} className="flex items-center gap-4">
      {props.options.map((option) => {
        const selected = props.value === option.value;
        return (
          <label key={option.value} className="flex cursor-pointer items-center">
            <input
              type="radio"
              name={props.name}
              className="peer sr-only"
              checked={selected}
              onChange={() => props.onChange(option.value)}
            />
            <span className="flex items-center gap-1.5 rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
              <span
                aria-hidden
                className={`h-3 w-3 rounded-full transition ${selected ? "bg-ink ring-2 ring-ink/15" : "border border-line"}`}
              />
              <span className={`text-[13px] ${selected ? "font-semibold text-ink" : "text-sub"}`}>{option.label}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-[12px] font-medium text-[#c4312b]">
      {message}
    </p>
  );
}

/** 저장된 입력이 있으면 그 값으로 폼을 채운다. key로 다시 마운트해서 effect 없이 초기값을 넣는다. */
export default function InputForm() {
  const stored = useStoredInput();
  const initial = stored.input ? inputToForm(stored.input) : EMPTY_FORM;
  return <InputFormFields key={stored.raw ?? "empty"} initial={initial} />;
}

function InputFormFields({ initial }: { initial: FormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = formToInput(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    clearSaju();
    saveInput(result.input);
    router.push("/result");
  }

  const dateError = errors.year ?? errors.month ?? errors.day;
  const timeEnabled = values.timeKnown;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold">생년월일</p>
          <RadioPair
            ariaLabel="달력"
            name="calendar"
            value={values.calendar}
            options={[
              { value: "solar", label: "양력" },
              { value: "lunar", label: "음력" },
            ]}
            onChange={(v) => update("calendar", v)}
          />
        </div>

        <div className="mt-2 grid grid-cols-[1.4fr_1fr_1fr] gap-2">
          {(
            [
              ["year", "년", "1990", 4],
              ["month", "월", "5", 2],
              ["day", "일", "15", 2],
            ] as const
          ).map(([key, unit, placeholder, maxLength]) => (
            <label key={key} className="relative">
              <span className="sr-only">{unit}</span>
              <input
                inputMode="numeric"
                maxLength={maxLength}
                placeholder={placeholder}
                value={values[key]}
                aria-invalid={Boolean(errors[key])}
                aria-describedby={errors[key] ? "date-error" : undefined}
                onChange={(e) => update(key, e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} pr-6`}
              />
              <span aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[12px] text-sub">
                {unit}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="date-error" message={dateError} />

        {values.calendar === "lunar" && (
          <label className="mt-2 flex items-center gap-2 text-[13px]">
            <input type="checkbox" className="h-4 w-4 accent-[#16181d]" checked={values.isLeapMonth} onChange={(e) => update("isLeapMonth", e.target.checked)} />
            윤달이에요
          </label>
        )}
      </div>

      <div>
        <p className="text-[13px] font-semibold">태어난 시간</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="time"
            value={values.time}
            disabled={!timeEnabled}
            aria-invalid={Boolean(errors.time)}
            aria-describedby={errors.time ? "time-error" : undefined}
            onChange={(e) => update("time", e.target.value)}
            className={`${inputClass} ${!timeEnabled ? "opacity-45" : ""}`}
          />
          <span className="relative">
            <select
              value={values.placeId}
              disabled={!timeEnabled}
              onChange={(e) => update("placeId", e.target.value)}
              className={`${inputClass} appearance-none pr-5 ${!timeEnabled ? "opacity-45" : ""}`}
            >
              {PLACE_GROUPS.map((group) => (
                <optgroup key={group.province} label={group.province}>
                  {group.places.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.city}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[12px] text-sub">
              ▾
            </span>
          </span>
        </div>
        <FieldError id="time-error" message={errors.time} />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#16181d]"
              checked={!timeEnabled}
              onChange={(e) => update("timeKnown", !e.target.checked)}
            />
            시간을 몰라요
          </label>
          <span className="text-[12px] text-sub">시간을 넣으면 시주까지 더 자세히 풀이해요</span>
        </div>
        {timeEnabled && <p className="mt-1 text-[11px] text-sub">출생지 경도와 과거 서머타임을 반영해 계산해요.</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <p className="text-[13px] font-semibold">성별</p>
          <span className="text-[11px] text-sub">대운 계산에 필요해요</span>
        </div>
        <RadioPair
          ariaLabel="성별"
          name="gender"
          value={values.gender}
          describedBy={errors.gender ? "gender-error" : undefined}
          options={[
            { value: "female", label: "여성" },
            { value: "male", label: "남성" },
          ]}
          onChange={(v) => update("gender", v)}
        />
      </div>
      <FieldError id="gender-error" message={errors.gender} />

      {errors.form && (
        <p role="alert" className="rounded-xl bg-[#fdecea] px-4 py-3 text-[14px] font-medium text-[#9f2a24]">
          {errors.form}
        </p>
      )}

      <button type="submit" className="h-12 rounded-full bg-ink text-[16px] font-bold text-white transition active:scale-[0.99]">
        내 일주 보기
      </button>
    </form>
  );
}
