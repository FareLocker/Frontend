import Link from "next/link";
import Card from "@/components/Card";
import { pillClass } from "@/components/PillLink";
import { cardHeadingClass } from "@/components/trade/FlightDetailsCard";
import { formatDate, formatMoney } from "@/lib/format";
import { transactionTypeLabel, type TransactionType } from "@/lib/transaction-types";
import { getTransactions } from "@/lib/transactions";
import type { Money } from "@/types/fare";
import TransactionTypeFilter from "./TransactionTypeFilter";

const th = "border-b border-line py-2.5 text-[11px] font-normal uppercase tracking-[0.1em] text-muted";
const td = "border-b border-foreground/10 py-3.5";

/**
 * "Activity": every movement in and out of the member's wallet, newest
 * first, with a drop-down to show one type at a time.
 */
export default async function ActivityCard({
  type,
}: {
  /** Show only this type; null shows everything. */
  type: TransactionType | null;
}) {
  const transactions = await getTransactions(type);

  return (
    <Card className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-3.5">
        <h2 className={`${cardHeadingClass} pb-0`}>Activity</h2>
        <div className="flex flex-wrap items-center gap-3">
          <TransactionTypeFilter current={type} />
          {/* LATER (statement): does nothing yet. Link it to a file the backend makes. */}
          <button type="button" className={`${pillClass.sm} cursor-pointer`}>
            Download statement
          </button>
        </div>
      </div>

      {transactions.length ? (
        // A wide table scrolls sideways inside the card on a narrow screen.
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead>
              <tr>
                <th scope="col" className={`${th} pr-3`}>Date</th>
                <th scope="col" className={`${th} px-3`}>Type</th>
                <th scope="col" className={`${th} px-3`}>What happened</th>
                <th scope="col" className={`${th} px-3`}>Status</th>
                <th scope="col" className={`${th} pl-3 text-right`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((entry) => (
                <tr key={entry.id}>
                  <td className={`${td} pr-3 whitespace-nowrap text-muted`}>
                    {formatDate(entry.date)}
                  </td>
                  <td className={`${td} px-3`}>
                    <span className="rounded-full border border-foreground/20 px-3 py-1 text-[11px] whitespace-nowrap uppercase tracking-[0.05em]">
                      {transactionTypeLabel[entry.type]}
                    </span>
                  </td>
                  <td className={`${td} px-3 font-semibold`}>
                    {entry.fareId ? (
                      <Link
                        href={`/fares/${entry.fareId}`}
                        className="underline underline-offset-[3px] hover:opacity-80"
                      >
                        {entry.description}
                      </Link>
                    ) : (
                      entry.description
                    )}
                  </td>
                  <td className={`${td} px-3 text-muted`}>{entry.status}</td>
                  <td className={`${td} pl-3 text-right font-semibold whitespace-nowrap tabular-nums`}>
                    {formatSigned(entry.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border-t border-foreground/10 pt-5 text-[13px] text-soft">
          {type
            ? `No ${transactionTypeLabel[type].toLowerCase()} transactions yet.`
            : "Nothing has moved in or out of your wallet yet."}
        </p>
      )}
    </Card>
  );
}

/** "+$138" for money in, "−$24" for money out. */
function formatSigned(amount: Money): string {
  const size = formatMoney({ ...amount, amount: Math.abs(amount.amount) });
  return `${amount.amount < 0 ? "−" : "+"}${size}`;
}
