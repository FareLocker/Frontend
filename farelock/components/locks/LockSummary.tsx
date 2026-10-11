import Card from "@/components/Card";
import LabelValue from "@/components/LabelValue";
import { daysUntil, formatDaysAway, formatMoney } from "@/lib/format";
import { isActive, lockValue } from "@/lib/locks";
import type { Money } from "@/types/fare";
import type { Lock } from "@/types/lock";

/**
 * The three figures at the top of My locks: how many locks are running,
 * what they would pay if exercised now, and what has been paid out so far.
 */
export default function LockSummary({ locks, now }: { locks: Lock[]; now: Date }) {
  const open = locks.filter((lock) => lock.status === "open");
  const valued = open.filter((lock) => lock.fare !== null);
  const paid = locks.filter((lock) => (lock.payout?.amount ?? 0) > 0);
  const soonest = Math.min(...open.map((lock) => daysUntil(lock.departs, now)));

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <Card tone="raised" size="md">
        <LabelValue
          label="Active locks"
          size="lg"
          detail={
            <span className="text-muted">
              {open.length
                ? `Next one ends ${soonest > 0 ? `in ${formatDaysAway(soonest)}` : "today"}`
                : "None right now"}
            </span>
          }
        >
          {locks.filter(isActive).length}
        </LabelValue>
      </Card>
      <Card tone="raised" size="md">
        <LabelValue
          label="Worth right now"
          size="lg"
          detail={
            <span className="text-muted">
              {valued.length === open.length
                ? "What your active locks would pay today"
                : `${open.length - valued.length} active valuation unavailable`}
            </span>
          }
        >
          {formatMoney(
            total(
              valued.map((lock) =>
                lockValue(lock.lockedFare, lock.fare as Money),
              ),
            ),
          )}
        </LabelValue>
      </Card>
      <Card tone="raised" size="md">
        <LabelValue
          label="Paid out so far"
          size="lg"
          detail={
            <span className="text-muted">
              {paid.length
                ? `Across ${paid.length === 1 ? "1 lock" : `${paid.length} locks`}`
                : "Nothing yet"}
            </span>
          }
        >
          {formatMoney(total(paid.map((lock) => lock.payout as Money)))}
        </LabelValue>
      </Card>
    </div>
  );
}

/** Adds amounts up. LATER: assumes one currency, like the rest of the site. */
function total(amounts: Money[]): Money {
  return {
    amount: amounts.reduce((sum, money) => sum + money.amount, 0),
    currency: amounts[0]?.currency ?? "USD",
  };
}
