import Card from "@/components/Card";
import { formatDaysAway, formatMoney } from "@/lib/format";
import type { FareDetail } from "@/types/fare";

const caption =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-muted";

/**
 * The lowest and highest fare we have seen for this flight, and where today's
 * fare sits between them. All three come from the same history the chart
 * draws. With too little history to have a range, it shows nothing.
 */
export default function FareRangeCards({
  fare,
  daysAway,
}: {
  fare: FareDetail;
  /** Whole days until the flight departs. */
  daysAway: number;
}) {
  if (fare.history.length < 2) return null;

  const amounts = fare.history.map((point) => point.amount);
  const low = Math.min(...amounts);
  const high = Math.max(...amounts);
  const { currency } = fare.fare;
  // How far along the low-to-high line today's fare sits, 0 to 100.
  const position =
    high > low
      ? Math.min(100, Math.max(0, ((fare.fare.amount - low) / (high - low)) * 100))
      : 50;

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
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

      <Card tone="raised" size="md" className="flex flex-col gap-3.5">
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <h3 className={caption}>Where today&rsquo;s fare sits</h3>
          <p className="text-[13px] font-semibold">
            {daysAway > 0
              ? `${formatDaysAway(daysAway)} to departure`
              : "Departs today"}
          </p>
        </div>
        <div
          role="img"
          aria-label={`Today's fare is ${Math.round(position)}% of the way from the lowest tracked fare to the highest.`}
          className="relative h-[18px]"
        >
          <span className="absolute inset-x-0 top-2 h-0.5 rounded-full bg-foreground/25" />
          <span
            className="absolute top-0.5 -ml-[7px] h-3.5 w-3.5 rounded-full border-[3px] border-raised bg-foreground"
            style={{ left: `${position}%` }}
          />
        </div>
        <div aria-hidden className="flex justify-between text-xs text-muted">
          <span>Low</span>
          <span>High</span>
        </div>
      </Card>
    </>
  );
}
