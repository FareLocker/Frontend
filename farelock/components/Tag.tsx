import type { ReactNode } from "react";

/** A small grey pill for a short fact, e.g. "Nonstop" or "Economy". Not a link. */
export default function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-foreground/10 px-4 py-2 text-xs font-medium">
      {children}
    </span>
  );
}
