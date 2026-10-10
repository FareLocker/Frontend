import type { ReactNode } from "react";

const valueClass = {
  /** Supporting figure, e.g. a lock fee. */
  sm: "text-[13px] font-semibold",
  /** A time. */
  lg: "text-[2rem] leading-[1.1] font-light tracking-[-0.04em] tabular-nums",
  /** The headline number, e.g. the fare. */
  xl: "text-[2.75rem] leading-none font-extralight tracking-[-0.05em] tabular-nums",
} as const;

/**
 * A small uppercase label over a value: "DEPART / 07:40", "FARE / $612".
 * `detail` is an optional quieter line underneath.
 */
export default function LabelValue({
  label,
  children,
  size = "sm",
  detail,
  className = "",
}: {
  label: string;
  children: ReactNode;
  size?: keyof typeof valueClass;
  detail?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
        {label}
      </span>
      <span className={valueClass[size]}>{children}</span>
      {detail ? <span className="text-[13px]">{detail}</span> : null}
    </div>
  );
}
