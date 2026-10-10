import type { ReactNode } from "react";

/**
 * A list of facts: small label on the left, value on the right, hairline
 * between rows.
 *
 *   <DetailList>
 *     <DetailRow label="Aircraft">A330-900</DetailRow>
 *     <DetailRow label="Bags">1 carry-on</DetailRow>
 *   </DetailList>
 */
export default function DetailList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <dl className={className}>{children}</dl>;
}

export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t border-foreground/10 py-[13px]">
      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted">
        {label}
      </dt>
      <dd className="text-right text-[13px] font-semibold">{children}</dd>
    </div>
  );
}
