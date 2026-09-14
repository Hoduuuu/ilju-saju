"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EMPTY_FORM, formToInput, inputToForm, type FormErrors, type FormValues } from "@/lib/input/form";
import { clearSaju, saveInput } from "@/lib/input/storage";
import { useStoredInput } from "@/lib/input/useStoredInput";
import { placesByProvince } from "@/lib/saju/places";

const PLACE_GROUPS = placesByProvince();
const inputClass =
  "h-11 w-full rounded-xl border border-line bg-white px-3 text-[16px] font-medium text-ink outline-none transition focus:border-ink";

function Segmented<T extends string>(props: {
  label: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  describedBy?: string;
}) {
  const name = `segmented-${props.label}`;
  return (
    <div role="radiogroup" aria-label={props.label} aria-describedby={props.describedBy} className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-soft p-1">
      {props.options.map((option) => {
        const selected = props.value === option.value;
        return (
          <label key={option.value} className="relative flex cursor-pointer">
            <input
              type="radio"
              name={name}
              className="peer sr-only"
              checked={selected}
              onChange={() => props.onChange(option.value)}
            />
            <span
              className={`flex h-10 w-full items-center justify-center rounded-xl text-[14px] font-semibold transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${
                selected ? "bg-white text-ink shadow-[0_1px_4px_rgba(22,24,29,0.12)]" : "text-sub"
              }`}
            >
              {option.label}
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
    <p id={id} className="mt-1.5 text-[13px] font-medium text-[#c4312b]">
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

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-4">
      <div>
        <p className="mb-2 text-[14px] font-bold">달력</p>
        <Segmented
          label="달력"
          value={values.calendar}
          options={[
            { value: "solar", label: "양력" },
            { value: "lunar", label: "음력" },
          ]}
          onChange={(v) => update("calendar", v)}
        />
        {values.calendar === "lunar" && (
          <label className="mt-3 flex items-center gap-2 text-[14px] font-medium">
            <input type="checkbox" className="h-4 w-4 accent-[#16181d]" checked={values.isLeapMonth} onChange={(e) => update("isLeapMonth", e.target.checked)} />
            윤달이에요
          </label>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-[14px] font-bold">생년월일</legend>
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
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
                className={`${inputClass} pr-8`}
              />
              <span aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] text-sub">
                {unit}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="date-error" message={dateError} />
      </fieldset>

      <div>
        <p className="mb-2 text-[14px] font-bold">성별</p>
        <Segmented
          label="성별"
          value={values.gender}
          describedBy={errors.gender ? "gender-error" : undefined}
          options={[
            { value: "female", label: "여성" },
            { value: "male", label: "남성" },
          ]}
          onChange={(v) => update("gender", v)}
        />
        <FieldError id="gender-error" message={errors.gender} />
      </div>

      <fieldset>
        <legend className="text-[14px] font-bold">태어난 시간</legend>
        <p className="mt-1 text-[12px] leading-relaxed text-sub">시간을 넣으면 시주까지 8글자로 더 자세히 풀이해요. 모르면 6글자로 풀이해요.</p>
        <div className="mt-2">
          <Segmented
            label="태어난 시간"
            value={values.timeKnown ? "known" : "unknown"}
            options={[
              { value: "known", label: "시간 알아요" },
              { value: "unknown", label: "잘 몰라요" },
            ]}
            onChange={(v) => update("timeKnown", v === "known")}
          />
        </div>

        {values.timeKnown && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label>
              <span className="mb-1.5 block text-[13px] font-semibold text-sub">시간</span>
              <input
                type="time"
                value={values.time}
                aria-invalid={Boolean(errors.time)}
                aria-describedby={errors.time ? "time-error" : undefined}
                onChange={(e) => update("time", e.target.value)}
                className={inputClass}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-[13px] font-semibold text-sub">출생지</span>
              <select value={values.placeId} onChange={(e) => update("placeId", e.target.value)} className={inputClass}>
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
            </label>
            <div className="col-span-2">
              <FieldError id="time-error" message={errors.time} />
              <p className="mt-1 text-[11px] leading-relaxed text-sub">출생지 경도와 과거 서머타임을 반영해 실제 태양 시간으로 보정해요.</p>
            </div>
          </div>
        )}
      </fieldset>

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
