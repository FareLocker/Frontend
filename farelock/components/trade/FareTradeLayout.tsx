import type { ReactNode } from "react";

/**
 * The trading page's two columns: the fare on the left, the lock on the
 * right. Below the `lg` width they stack, fare first.
 *
 * Below `md` (a phone) both wrappers become `display: contents`, so their
 * cards share one column and the page orders them with `order-*` classes:
 * the price, then the lock, then the details. The <aside> keeps its label;
 * the lock cards inside it still carry their own headings.
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
    <div className="grid items-start gap-5 max-md:flex max-md:flex-col max-md:items-stretch lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-5 max-md:contents">{main}</div>
      <aside aria-label="Lock this fare" className="flex min-w-0 flex-col gap-5 max-md:contents">
        {aside}
      </aside>
    </div>
  );
}
