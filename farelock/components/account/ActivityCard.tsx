import { Suspense } from "react";
import Card from "@/components/Card";
import LocalDate from "@/components/LocalDate";
import { cardHeadingClass } from "@/components/trade/FlightDetailsCard";
import { formatMoney } from "@/lib/format";
import {
  transactionTypeLabel,
  unknownTransactionTypeLabel,
  type TransactionType,
} from "@/lib/transaction-types";
import { getTransactions } from "@/lib/transactions";
import type { Money } from "@/types/fare";
import TransactionTypeFilter from "./TransactionTypeFilter";

const th = "border-b border-line py-2.5 text-[11px] font-normal uppercase tracking-[0.1em] text-muted";
const td = "border-b border-foreground/10 py-3.5";
const messageClass = "border-t border-foreground/10 pt-5 text-[13px] text-soft";

/**
 * "Activity": every movement in and out of the member's wallet, newest
 * first, with a drop-down to show one type at a time.
 *
 * The heading and the drop-down are drawn at once. The rows wait for the
 * backend inside their own <Suspense>, so a slow ledger holds up this card
 * only, not the rest of the account page.
 */
export default function ActivityCard({
  type,
}: {
  /** Show only this type; null shows everything. */
  type: TransactionType | null;
}) {
  return (
    <Card className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-3.5">
        <h2 className={`${cardHeadingClass} pb-0`}>Activity</h2>
        <TransactionTypeFilter current={type} />
      </div>
      <Suspense fallback={<ActivityRowsSkeleton />}>
        <ActivityRows type={type} />
      </Suspense>
    </Card>
  );
}

/** The table, or a line saying why there isn't one. */
async function ActivityRows({ type }: { type: TransactionType | null }) {
  const result = await getTransactions(type);

  if (!result.ok) {
    return (
      <p role="alert" className={messageClass}>
        Couldn&apos;t load your activity. Refresh the page to try again.
      </p>
    );
  }

  if (result.transactions.length === 0) {
    return (
      <p className={messageClass}>
        {type
          ? `No ${transactionTypeLabel[type].toLowerCase()} transactions yet.`
          : "Nothing has moved in or out of your wallet yet."}
      </p>
    );
  }

  return (
    // A wide table scrolls sideways inside the card on a narrow screen.
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
        <thead>
          <tr>
            <th scope="col" className={`${th} pr-3`}>Date</th>
            <th scope="col" className={`${th} px-3`}>Type</th>
            <th scope="col" className={`${th} px-3`}>What happened</th>
            <th scope="col" className={`${th} pl-3 text-right`}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {result.transactions.map((entry) => (
            <tr key={entry.id}>
              <td className={`${td} pr-3 whitespace-nowrap text-muted`}>
                <LocalDate iso={entry.createdAt} />
              </td>
              <td className={`${td} px-3`}>
                <span className="rounded-full border border-foreground/20 px-3 py-1 text-[11px] whitespace-nowrap uppercase tracking-[0.05em]">
                  {entry.type ? transactionTypeLabel[entry.type] : unknownTransactionTypeLabel}
                </span>
              </td>
              <td className={`${td} px-3 font-semibold`}>{entry.description}</td>
              <td className={`${td} pl-3 text-right font-semibold whitespace-nowrap tabular-nums`}>
                {formatSigned(entry.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Grey bars where the rows will be, so the card keeps its height while loading. */
function ActivityRowsSkeleton() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col border-t border-foreground/10 motion-reduce:animate-none"
    >
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center gap-6 border-b border-foreground/10 py-4">
          <span className="h-3.5 w-20 rounded-full bg-foreground/[0.06]" />
          <span className="h-3.5 w-16 rounded-full bg-foreground/[0.06]" />
          <span className="h-3.5 flex-1 rounded-full bg-foreground/[0.06]" />
          <span className="h-3.5 w-14 rounded-full bg-foreground/[0.06]" />
        </div>
      ))}
    </div>
  );
}

/** "+$138" for money in, "−$24" for money out, "$0" for neither. */
function formatSigned(amount: Money): string {
  const size = formatMoney({ ...amount, amount: Math.abs(amount.amount) });
  if (amount.amount === 0) return size;
  return `${amount.amount < 0 ? "−" : "+"}${size}`;
}
