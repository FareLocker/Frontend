import Card from "@/components/Card";
import { LockIcon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import QuoteTimer from "./QuoteTimer";

/**
 * The small card at the top of the fare page's right-hand column. It says
 * where the visitor stands with this fare:
 *
 *   "available"    a lock can be bought (shows the quote countdown)
 *   "unavailable"  no lock is for sale on this fare
 *   "held"         they already hold one (pass `boughtOn`)
 */
export default function LockStatusCard({
  status,
  boughtOn,
}: {
  status: "available" | "unavailable" | "held";
  /** For "held": the day the lock was bought, "YYYY-MM-DD". */
  boughtOn?: string;
}) {
  const title = {
    available: "Lock available",
    unavailable: "Lock not available",
    held: "You hold a lock on this fare",
  }[status];

  return (
    <Card
      tone="raised"
      size="md"
      label="Lock status"
      className="flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <p className="text-[1.1rem] font-semibold tracking-[-0.02em]">{title}</p>
        <p className="mt-1 text-[13px] text-muted">
          {status === "available" ? <QuoteTimer /> : null}
          {status === "unavailable" ? "We can't price a lock on this fare right now" : null}
          {status === "held" && boughtOn ? `Bought ${formatDate(boughtOn)}` : null}
        </p>
      </div>
      {/* The accent marks a lock that is yours. */}
      <LockIcon
        className={`h-11 w-11 shrink-0 ${
          status === "held" ? "text-accent" : status === "unavailable" ? "opacity-40" : ""
        }`}
      />
    </Card>
  );
}
