"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useTransition } from "react";
import {
  transactionTypeLabel,
  transactionTypes,
  type TransactionType,
} from "@/lib/transaction-types";

/**
 * The "Transaction type" drop-down above the Activity list.
 *
 * Picking a type puts it in the address (/account?type=payout) and the page
 * is rendered again with only those transactions. Nothing is filtered in the
 * browser: the server (later, the backend) sends back the right ones.
 */
export default function TransactionTypeFilter({
  current,
}: {
  /** The type in the address now, or null for every type. */
  current: TransactionType | null;
}) {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // True while the page is being fetched again, to show the choice is taking.
  const [pending, startTransition] = useTransition();

  function choose(type: string) {
    const params = new URLSearchParams(searchParams);
    if (type) params.set("type", type);
    else params.delete("type");
    const query = params.toString();
    startTransition(() => {
      // Keep the reader's place: the list is right under the drop-down.
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 max-md:flex-col max-md:items-stretch max-md:gap-2">
      <label htmlFor={id} className="text-[11px] uppercase tracking-[0.1em] text-muted">
        Transaction type
      </label>
      <div className="relative">
        <select
          id={id}
          value={current ?? ""}
          onChange={(event) => choose(event.target.value)}
          aria-busy={pending}
          className={`h-11 cursor-pointer appearance-none rounded-full border border-foreground/30 bg-background pr-[42px] pl-[18px] text-[13px] font-medium max-md:h-12 max-md:w-full max-md:text-base transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
            pending ? "opacity-60" : ""
          }`}
        >
          <option value="">All types</option>
          {transactionTypes.map((type) => (
            <option key={type} value={type}>
              {transactionTypeLabel[type]}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-4 right-[18px] h-3 w-3 max-md:top-[18px]"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </div>
    </div>
  );
}
