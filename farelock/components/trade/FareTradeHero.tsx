import Label from "@/components/Label";
import Tag from "@/components/Tag";
import {
  formatDate,
  formatMoney,
  formatStops,
  formatTime,
  formatTrend,
} from "@/lib/format";
import type { FareDetail } from "@/types/fare";
import FareTradeChart from "./FareTradeChart";

/**
 * The big black panel at the top of the trading page: which flight this is,
 * its fare history as a dotted chart, and today's fare in a glass bar.
 *
 * The chart shows all the history we have for the fare, however long that is.
 */
export default function FareTradeHero({ fare }: { fare: FareDetail }) {
  const points = fare.history.map((point) => point.amount);
  const hasChart = points.length >= 2;

  return (
    <section
      aria-label="Fare history"
      className="pixel-grid-lg relative flex min-h-[580px] flex-col justify-between gap-10 overflow-hidden rounded-[2rem] border border-foreground/10 bg-pitch p-6 sm:p-8"
    >
      {hasChart ? <FareTradeChart points={points} /> : null}

      <div className="relative flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-col gap-2.5">
          <Label>Fare history</Label>
          <h1 className="text-[clamp(1.9rem,3.2vw,2.6rem)] leading-[1.08] tracking-[-0.04em]">
            {fare.depart.city} to {fare.arrive.city}
          </h1>
          <p className="text-muted">
            {formatDate(fare.depart.localTime)} ·{" "}
            {formatTime(fare.depart.localTime)} to{" "}
            {formatTime(fare.arrive.localTime)} ·{" "}
            {formatStops(fare.stopAirports)}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Tag>{fare.airlineName}</Tag>
            <Tag>{fare.flightNumber}</Tag>
            <Tag>{fare.cabinClass}</Tag>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2.5">
          {/*
           * LATER (fare updates): the fare on this page is fetched once, when
           * the page loads, and does not change after that. When the backend
           * can push or be polled for a new fare, refresh the page's data
           * here (for example router.refresh() on a timer, or a subscription)
           * and show when it was last checked next to this label.
           */}
          <p className="flex items-center gap-2.5 rounded-full bg-card/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.05em] backdrop-blur-sm">
            <span aria-hidden className="relative h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
              <span className="absolute inset-0 rounded-full bg-accent" />
            </span>
            Live fare
          </p>
          {hasChart ? (
            <p className="text-xs text-muted">
              Tracked since {formatDate(fare.history[0].date)}
            </p>
          ) : null}
        </div>
      </div>

      {hasChart ? null : (
        <p className="relative max-w-sm text-muted">
          We have only just started tracking this fare, so there is no history
          to show yet.
        </p>
      )}

      <div className="relative flex flex-wrap items-center justify-between gap-x-8 gap-y-3 rounded-3xl border border-foreground/15 bg-card/60 px-6 py-[22px] backdrop-blur-xl sm:px-[30px]">
        <p className="text-[clamp(3rem,6vw,4.75rem)] leading-none font-extralight tracking-[-0.05em] tabular-nums">
          {formatMoney(fare.fare)}
        </p>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Current fare
          </span>
          <span className="text-[13px] font-medium">
            {formatTrend(fare.trend.changePercent)}
          </span>
        </div>
      </div>
    </section>
  );
}
