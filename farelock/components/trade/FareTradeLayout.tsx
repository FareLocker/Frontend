import type { ReactNode } from "react";

/**
 * The trading page's two columns: the fare on the left, the lock on the
 * right. Below the `lg` width they stack, fare first.
 *
 * The page and its loading skeleton both use this, so they cannot drift apart.
 */
export default function FareTradeLayout({
  main,
  aside,
}: {
  main: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-5">{main}</div>
      <aside aria-label="Lock this fare" className="flex min-w-0 flex-col gap-5">
        {aside}
      </aside>
    </div>
  );
}
