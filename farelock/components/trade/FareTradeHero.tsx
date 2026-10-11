import Label from "@/components/Label";
import Tag from "@/components/Tag";
import {
  formatDate,
  formatMoney,
  formatStops,
  formatTime,
  formatTrend,
} from "@/lib/format";
import { lockStatusLabel } from "@/lib/locks";
import type { FareDetail, Money } from "@/types/fare";
import type { Lock } from "@/types/lock";
import FareTradeChart, { type ChartLock } from "./FareTradeChart";

const statLabel =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-muted";

/** Phone: the three tags share one row, each shortening with an ellipsis. */
const heroTag =
  "max-md:min-w-0 max-md:shrink max-md:truncate max-md:px-2 max-md:py-[7px] max-md:text-[11px] max-md:tracking-[-0.02em]";

/**
 * The big black panel at the top of the trading page: which flight this is,
 * its fare history as a dotted chart, and the fare in a glass bar.
 *
 * The chart shows all the history we have for the fare, however long that is.
 *
 * With `lock` (the member's lock on this fare), the chart also marks the day
 * it was bought and the locked fare, a key in the corner says what the two
 * lines are, and the glass bar adds the locked fare beside today's. Once the lock has ended, the "Live fare" tag gives way to
 * its status and the bar shows how it ended.
 *
 * On a phone (below md) the labels sit in their own blocks above the chart,
 * which fills the bottom 56% of the panel, so nothing prints over its dots;
 * the airline, flight and cabin tags stay on one row and shorten with an
 * ellipsis if they must.
 */
export default function FareTradeHero({
  fare,
  lock = null,
  className = "",
}: {
  fare: FareDetail;
  lock?: Lock | null;
  className?: string;
}) {
  const points = fare.history.map((point) => point.amount);
  const hasChart = points.length >= 2;
  const ended = lock !== null && lock.status !== "open";
  const mark = lock && hasChart ? chartLock(fare, lock) : null;

  return (
    <section
      aria-label="Fare history"
      className={`pixel-grid-lg relative flex min-h-[580px] flex-col justify-between gap-10 overflow-hidden rounded-[2rem] border border-foreground/10 bg-pitch p-6 max-md:min-h-[600px] max-md:gap-8 max-md:rounded-3xl max-md:p-5 md:p-8 ${className}`}
    >
      {hasChart ? (
        <FareTradeChart points={points} lock={mark ?? undefined} />
      ) : null}

      <div className="relative flex flex-wrap items-start justify-between gap-x-6 gap-y-4 max-md:flex-col max-md:flex-nowrap max-md:gap-3.5">
        <div className="flex min-w-0 flex-col gap-2.5 max-md:w-full max-md:gap-2">
          <Label>Fare history</Label>
          <h1 className="text-[clamp(1.9rem,3.2vw,2.6rem)] leading-[1.08] tracking-[-0.04em] max-md:text-[1.75rem] max-md:[overflow-wrap:anywhere]">
            {fare.depart.city} to {fare.arrive.city}
          </h1>
          <p className="text-muted max-md:text-[0.9rem]">
            {formatDate(fare.depart.localTime)} ·{" "}
            {formatTime(fare.depart.localTime)} to{" "}
            {formatTime(fare.arrive.localTime)} ·{" "}
            {formatStops(fare.stopAirports)}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 max-md:min-w-0 max-md:flex-nowrap max-md:gap-[5px]">
            <Tag className={heroTag}>{fare.airlineName}</Tag>
            <Tag className={heroTag}>{fare.flightNumber}</Tag>
            <Tag className={heroTag}>{fare.cabinClass}</Tag>
          </div>
        </div>

        <div className="ml-auto flex flex-col items-end gap-2.5 max-md:ml-0 max-md:w-full max-md:flex-row max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-2">
          {ended ? (
            <p className="flex items-center gap-2.5 rounded-full border border-foreground/50 bg-card/80 px-4 py-[7px] text-xs font-bold uppercase tracking-[0.05em] backdrop-blur-sm">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-faint" />
              {lockStatusLabel[lock.status]}
            </p>
          ) : (
            /*
             * FarePoller re-fetches this page every few seconds. LATER: show
             * when the fare was last checked next to this label.
             */
            <p className="flex items-center gap-2.5 rounded-full bg-card/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.05em] backdrop-blur-sm">
              <span aria-hidden className="relative h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                <span className="absolute inset-0 rounded-full bg-accent" />
              </span>
              Live fare
            </p>
          )}
          {hasChart ? (
            <p className="text-xs text-muted">
              Tracked since {formatDate(fare.history[0].date)}
            </p>
          ) : null}
          {/*
           * What the two dashed lines on the chart mean, with their values.
           * The date and fare are written here rather than on a tag beside
           * the line, because the line can be anywhere across the chart and
           * a tag there would cover the title or the fares.
           */}
          {lock && mark ? (
            <ul
              aria-label="Chart key"
              className="flex flex-col items-end gap-1.5 text-xs text-muted max-md:max-w-full max-md:basis-full max-md:items-start max-md:self-start max-md:rounded-xl max-md:bg-card/80 max-md:px-3 max-md:py-2.5 max-md:backdrop-blur-md"
            >
              <li className="flex items-center gap-2.5 max-md:flex-row-reverse max-md:justify-end">
                <span>
                  Lock bought{" "}
                  <span className="font-semibold text-foreground">
                    {formatDate(lock.purchasedOn)}
                  </span>
                </span>
                <span aria-hidden className="flex w-[18px] justify-center">
                  <span className="h-3.5 border-l-2 border-dashed border-foreground" />
                </span>
              </li>
              <li className="flex items-center gap-2.5 max-md:flex-row-reverse max-md:justify-end">
                <span>
                  Your locked fare{" "}
                  <span className="font-semibold text-foreground">
                    {formatMoney(lock.lockedFare)}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="w-[18px] border-t-2 border-dashed border-foreground"
                />
              </li>
            </ul>
          ) : null}
        </div>
      </div>

      {hasChart ? null : (
        <p className="relative max-w-sm text-muted">
          We have only just started tracking this fare, so there is no history
          to show yet.
        </p>
      )}

      <div className="relative flex flex-wrap items-center justify-between gap-x-8 gap-y-3 rounded-3xl border border-foreground/15 bg-card/60 px-6 py-[22px] backdrop-blur-xl max-md:flex-col max-md:items-start max-md:gap-3.5 max-md:rounded-[20px] max-md:px-5 max-md:py-[18px] md:px-[30px]">
        <p
          className={`text-[clamp(3rem,6vw,4.75rem)] leading-none font-extralight tracking-[-0.05em] tabular-nums ${ended ? "text-soft" : ""}`}
        >
          {formatMoney(lock?.fare ?? fare.fare)}
        </p>
        <dl className="flex flex-wrap justify-end gap-x-9 gap-y-3 text-right max-md:grid max-md:w-full max-md:grid-cols-2 max-md:gap-x-7 max-md:text-left">
          {ended ? (
            <>
              <Stat
                label={
                  lock.status === "expired"
                    ? "Fare at departure"
                    : "Fare when exercised"
                }
              >
                {lock.endedOn ? `On ${formatDate(lock.endedOn)}` : "—"}
              </Stat>
              <Stat label="Your locked fare">
                {formatMoney(lock.lockedFare)}
              </Stat>
              <Stat label="FareLock paid">
                {lock.payout ? formatMoney(lock.payout) : "Being checked"}
              </Stat>
            </>
          ) : (
            <>
              <Stat label="Current fare">
                {formatTrend(fare.trend.changePercent)}
              </Stat>
              {lock ? (
                <>
                  <Stat label="Your locked fare">
                    {formatMoney(lock.lockedFare)}
                  </Stat>
                  <Stat label="Since you locked">
                    {formatChange(lock.lockedFare, fare.fare)}
                  </Stat>
                </>
              ) : null}
            </>
          )}
        </dl>
      </div>
    </section>
  );
}

/** One small label-over-value pair in the glass bar. */
function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-end gap-1.5 max-md:items-start">
      <dt className={statLabel}>{label}</dt>
      <dd className="text-[13px] font-medium">{children}</dd>
    </div>
  );
}

/** "Down $14", "Up $82" or "No change", from the locked fare to now. */
function formatChange(from: Money, to: Money): string {
  const change = to.amount - from.amount;
  if (change === 0) return "No change";
  const size = formatMoney({
    amount: Math.abs(change),
    currency: from.currency,
  });
  return `${change < 0 ? "Down" : "Up"} ${size}`;
}

/**
 * Where the lock sits in the fare's history, for the chart. null if the
 * history does not reach back to the day it was bought, in which case there
 * is nowhere to draw it.
 */
function chartLock(fare: FareDetail, lock: Lock): ChartLock | null {
  const boughtIndex = fare.history.findIndex(
    (point) => point.date >= lock.purchasedOn,
  );
  if (boughtIndex < 0 || fare.history[0].date > lock.purchasedOn) return null;
  const { endedOn } = lock;
  const endedIndex = endedOn
    ? fare.history.findLastIndex((point) => point.date <= endedOn)
    : -1;
  return {
    boughtIndex,
    lockedFare: lock.lockedFare.amount,
    endedIndex: endedIndex >= 0 ? endedIndex : undefined,
  };
}
