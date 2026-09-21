"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  as?: "ul" | "ol" | "div";
  /** 바깥 틀에 줄 클래스. 화면 끝까지 넓히는 음수 여백(-mx-5 등)과 바깥 여백은 여기에 준다 */
  wrapperClassName?: string;
  /** 스크롤 영역 자체의 클래스(flex, gap, 안쪽 여백 등) */
  className?: string;
  /** 그라데이션이 녹아들 배경색. 스크롤 영역이 놓인 바탕색과 같아야 한다 */
  fadeColor?: string;
  role?: string;
  "aria-label"?: string;
  children: ReactNode;
}

/**
 * 가로 스크롤 영역. 앞뒤로 더 넘길 내용이 남아 있으면 그쪽 끝을 배경색 그라데이션으로 덮어
 * 뒤에 항목이 더 있다는 걸 알려 준다. 끝까지 넘기면 해당 쪽 그라데이션은 사라진다.
 */
export default function HorizontalScroll({
  as: Tag = "div",
  wrapperClassName = "",
  className = "",
  fadeColor = "#ffffff",
  children,
  ...aria
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft > 2, end: el.scrollLeft < max - 2 });
    };
    // ResizeObserver는 관찰을 시작할 때 한 번 호출되므로 첫 상태도 여기서 잡힌다
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);

  const fade = "pointer-events-none absolute inset-y-0 z-10 w-10 transition-opacity duration-200";
  return (
    <div className={`relative ${wrapperClassName}`}>
      <Tag ref={ref as never} className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`} {...aria}>
        {children}
      </Tag>
      <div
        aria-hidden
        data-export-ignore="true"
        className={`${fade} left-0 ${edges.start ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(to right, ${fadeColor}, transparent)` }}
      />
      <div
        aria-hidden
        data-export-ignore="true"
        className={`${fade} right-0 ${edges.end ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(to left, ${fadeColor}, transparent)` }}
      />
    </div>
  );
}
