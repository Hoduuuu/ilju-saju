import type { ReactNode } from "react";

export default function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4 rounded-[20px] bg-soft p-4">
      <h3 className="text-[13px] font-semibold text-sub">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
