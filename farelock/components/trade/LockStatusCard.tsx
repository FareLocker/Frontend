import Card from "@/components/Card";
import { LockIcon } from "@/components/icons";
import { formatDate, formatDaysAway } from "@/lib/format";
import type { Lock } from "@/types/lock";
import QuoteTimer from "./QuoteTimer";

/**
 * The small card at the top of the fare page's right-hand column. It says
 * where the member stands with this fare:
 *
 *   no lock, one is for sale     "Lock available", with the quote countdown
 *   no lock, none for sale       "Lock not available"
 *   they hold an open lock       "You hold a lock on this fare"
 *   their lock has ended         how: expired, exercised, or still settling
 */
export default function LockStatusCard({
  lock = null,
  forSale = false,
  daysAway = 0,
  fareCents = 0,
}: {
  /** The member's lock on this fare, if they have one. */
  lock?: Lock | null;
  /** Without a lock: whether one can be bought on this fare. */
  forSale?: boolean;
  /** Whole days until the flight departs. */
  daysAway?: number;
  /** Live market fare in cents; when it changes the quote timer restarts. */
  fareCents?: number;
}) {
  const { title, detail, icon } = describe(lock, forSale, daysAway, fareCents);

  return (
    <Card
      tone="raised"
      size="md"
      label="Lock status"
      className="flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <p className="text-[1.1rem] font-semibold tracking-[-0.02em]">{title}</p>
        <p className="mt-1 text-[13px] text-muted">{detail}</p>
      </div>
      {/* The accent marks a lock that is yours and still running. */}
      <LockIcon className={`h-11 w-11 shrink-0 ${icon}`} />
    </Card>
  );
}

function describe(
  lock: Lock | null,
  forSale: boolean,
  daysAway: number,
  fareCents: number,
) {
  if (!lock) {
    return forSale
      ? {
          title: "Lock available",
          detail: <QuoteTimer fareCents={fareCents} />,
          icon: "",
        }
      : {
          title: "Lock not available",
          detail: "We can't price a lock on this fare right now",
          icon: "opacity-40",
        };
  }
  const ended = lock.endedOn ? `Ended ${formatDate(lock.endedOn)}` : "Ended";
  switch (lock.status) {
    case "open":
      return {
        title: "You hold a lock on this fare",
        detail:
          daysAway > 0
            ? `Active · ends in ${formatDaysAway(daysAway)}`
            : "Active · ends today",
        icon: "text-accent",
      };
    case "pending_verification":
      return {
        title: "Your lock is settling",
        detail: "Exercised · the payout is being checked",
        icon: "opacity-40",
      };
    case "exercised":
      return { title: "You exercised this lock", detail: ended, icon: "opacity-40" };
    case "expired":
      return { title: "This lock has expired", detail: ended, icon: "opacity-40" };
  }
}
