import type { ReactNode } from "react";

/** Small uppercase caption with a trailing dash, used above most blocks. */
export default function Label({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`block text-[0.7rem] uppercase tracking-[0.05em] ${className}`}
    >
      {children} —
    </span>
  );
}
