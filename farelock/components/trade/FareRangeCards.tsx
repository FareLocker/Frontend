import Card from "@/components/Card";
import { formatDaysAway, formatMoney } from "@/lib/format";
import type { FareDetail, Money } from "@/types/fare";

const caption =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-muted";

/**
 * The lowest and highest fare we have seen for this flight, and where today's
 * fare sits between them. All three come from the same history the chart
 * draws. With too little history to have a range, it shows nothing.
 *
 * With `lockedFare` (the member holds or held a lock), the line also carries
 * an accent tick at the locked fare: the fare is left of the tick exactly
 * when the lock is worth something.
 */
export default function FareRangeCards({
  fare,
  daysAway,
  lockedFare,
  className = "",
}: {
  fare: FareDetail;
  /** Whole days until the flight departs. Negative once it has left. */
  daysAway: number;
  lockedFare?: Money;
  /** Added to both of its blocks (it renders two). */
  className?: string;
}) {
  if (fare.history.length < 2) return null;
  const departed = daysAway < 0;

  const amounts = fare.history.map((point) => point.amount);
  const low = Math.min(...amounts);
  const high = Math.max(...amounts);
  const { currency } = fare.fare;
  /** How far along the low-to-high line an amount sits, 0 to 100. */
  const along = (amount: number) =>
    high > low ? Math.min(100, Math.max(0, ((amount - low) / (high - low)) * 100)) : 50;
  const position = along(fare.fare.amount);

  return (
    <>
      <div className={`grid grid-cols-2 gap-5 max-md:gap-3.5 ${className}`}>
        <Card size="md" className="flex flex-col gap-3.5">
          <h3 className={caption}>Lowest tracked</h3>
          <p className="text-[1.6rem] leading-none font-light tracking-[-0.04em] tabular-nums">
            {formatMoney({ amount: Math.round(low / 100) * 100, currency })}
          </p>
        </Card>
        <Card size="md" className="flex flex-col gap-3.5">
          <h3 className={caption}>Highest tracked</h3>
          <p className="text-[1.6rem] leading-none font-light tracking-[-0.04em] tabular-nums">
            {formatMoney({ amount: Math.round(high / 100) * 100, currency })}
          </p>
        </Card>
      </div>

      <Card tone="raised" size="md" className={`flex flex-col gap-3.5 ${className}`}>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <h3 className={caption}>
            {departed ? "Where the final fare sat" : "Where today\u2019s fare sits"}
          </h3>
          <p className="text-[13px] font-semibold">
            {departed
              ? "Departed"
              : daysAway > 0
                ? `${formatDaysAway(daysAway)} to departure`
                : "Departs today"}
          </p>
        </div>
        <div
          role="img"
          aria-label={`${departed ? "The final fare was" : "Today's fare is"} ${Math.round(position)}% of the way from the lowest tracked fare to the highest.${
            lockedFare
              ? ` Your locked fare is ${Math.round(along(lockedFare.amount))}% of the way.`
              : ""
          }`}
          className="relative h-[18px]"
        >
          <span className="absolute inset-x-0 top-2 h-0.5 rounded-full bg-foreground/25" />
          {lockedFare ? (
            <span
              className="absolute top-0 -ml-px h-[18px] w-[3px] rounded-[1px] bg-accent"
              style={{ left: `${along(lockedFare.amount)}%` }}
            />
          ) : null}
          <span
            className="absolute top-0.5 -ml-[7px] h-3.5 w-3.5 rounded-full border-[3px] border-raised bg-foreground"
            style={{ left: `${position}%` }}
          />
        </div>
        <div aria-hidden className="flex justify-between text-xs text-muted">
          <span>Low</span>
          <span>High</span>
        </div>
        {lockedFare ? (
          <ul
            aria-hidden
            className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-foreground/10 pt-3 text-xs text-muted"
          >
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground" />
              {departed ? "Final fare" : "Today\u2019s fare"}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-[3px] rounded-[1px] bg-accent" />
              Your locked fare
            </li>
          </ul>
        ) : null}
      </Card>
    </>
  );
}
