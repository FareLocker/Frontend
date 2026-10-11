import Link from "next/link";
import LabelValue from "@/components/LabelValue";
import Tag from "@/components/Tag";
import {
  formatDate,
  formatDuration,
  formatMoney,
  formatStops,
  formatTime,
  formatTrend,
} from "@/lib/format";
import type { FareSearchResult, FlightEndpoint } from "@/types/fare";
import FareSearchCardAni from "./FareSearchCardAni";

/** Shared by the card and its loading skeleton so the two stay the same size. */
export const fareCardClass =
  "flex flex-wrap items-stretch gap-x-8 gap-y-6 rounded-[2rem] border border-foreground/10 bg-card px-6 py-7 max-md:gap-y-[18px] max-md:rounded-3xl max-md:p-5 md:px-8";

const glassPill =
  "absolute top-3 rounded-full bg-card/80 px-3 py-1.5 text-[11px] backdrop-blur-sm";

/**
 * One search result. Three zones side by side that wrap on narrow screens:
 * the flight, its fare trend, and the price. On a phone (below md) each zone
 * is a full-width block, left-aligned, with depart and arrive side by side
 * and the duration as its own line under them.
 *
 * It renders on the server; only the trend chart (FareSearchCardAni) runs in
 * the browser.
 */
export default function FareSearchCard({
  fare,
  query,
}: {
  fare: FareSearchResult;
  query: string;
}) {
  const trendLabel = formatTrend(fare.trend.changePercent);

  return (
    <article className={fareCardClass}>
      {/* Flight */}
      <div className="flex min-w-0 flex-[2_1_520px] flex-col justify-between gap-7 max-md:gap-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 max-md:flex-col max-md:items-start max-md:gap-2.5">
          <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className="font-bold tracking-[-0.02em]">
              {fare.airlineName}
            </span>
            <span className="text-muted">{fare.flightNumber}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <Tag>{formatStops(fare.stopAirports)}</Tag>
            <Tag>{fare.cabinClass}</Tag>
          </div>
        </div>

        <div className="flex items-end gap-x-4 max-md:grid max-md:grid-cols-2 max-md:items-start max-md:gap-y-3 md:gap-x-5">
          <Endpoint label="Depart" endpoint={fare.depart} />
          <div className="flex min-w-10 flex-1 flex-col items-center gap-2.5 pb-[30px] max-md:hidden">
            <span className="text-xs text-muted">
              {formatDuration(fare.durationMinutes)}
            </span>
            <span aria-hidden className="flex items-center gap-1.5 self-stretch">
              <span className="h-1.75 w-1.75 shrink-0 rounded-full border border-foreground" />
              <span className="h-px flex-1 bg-foreground/30" />
              <span className="h-1.75 w-1.75 shrink-0 rounded-full bg-foreground" />
            </span>
          </div>
          <Endpoint label="Arrive" endpoint={fare.arrive} className="max-md:items-end max-md:text-right" />
          {/* Phone: the duration on its own line under depart and arrive. */}
          <div aria-hidden className="col-span-2 flex items-center gap-2.5 md:hidden">
            <span className="h-1.75 w-1.75 shrink-0 rounded-full border border-foreground" />
            <span className="h-px flex-1 bg-foreground/30" />
            <span className="shrink-0 text-xs text-muted">
              {formatDuration(fare.durationMinutes)}
            </span>
            <span className="h-px flex-1 bg-foreground/30" />
            <span className="h-1.75 w-1.75 shrink-0 rounded-full bg-foreground" />
          </div>
        </div>
      </div>

      {/* Fare trend */}
      <div className="pixel-grid relative min-h-37.5 min-w-0 flex-[1_1_260px] overflow-hidden rounded-[1.25rem] border border-foreground/[0.08] bg-pitch max-md:h-[120px] max-md:min-h-0 max-md:rounded-2xl">
        <FareSearchCardAni points={fare.trend.points} />
        <span
          className={`${glassPill} left-3 font-bold uppercase tracking-[0.05em]`}
        >
          Fare trend
        </span>
        <span className={`${glassPill} right-3 font-semibold`}>{trendLabel}</span>
      </div>

      {/* Price. Grows to fill its row, so it stays right-aligned when wrapped. */}
      <div className="flex min-w-0 flex-[1_1_230px] flex-col items-end justify-between gap-4 text-right max-md:items-start max-md:gap-3 max-md:text-left">
        <LabelValue label="Fare" size="xl" className="items-end max-md:items-start max-md:[&>span:nth-child(2)]:text-[2.5rem]">
          {formatMoney(fare.fare)}
        </LabelValue>
        <LabelValue label="Lock fee" className="items-end max-md:items-start">
          {fare.lock ? (
            <>
              {formatMoney(fare.lock.fee)}{" "}
              <span className="font-normal text-muted">until departure</span>
            </>
          ) : (
            <span className="font-normal text-muted">Not available</span>
          )}
        </LabelValue>
        <Link
          href={`/fares/${fare.id}?q=${encodeURIComponent(query)}`}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-[26px] text-[0.9rem] font-semibold max-md:mt-1 max-md:min-h-[52px] max-md:w-full max-md:text-[0.95rem] tracking-[-0.01em] text-background transition-colors duration-300 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          View fare
          <span className="sr-only">
            , {fare.airlineName} {fare.flightNumber}
          </span>
        </Link>
      </div>
    </article>
  );
}

function Endpoint({
  label,
  endpoint,
  className = "",
}: {
  label: string;
  endpoint: FlightEndpoint;
  className?: string;
}) {
  return (
    <LabelValue
      label={label}
      size="lg"
      className={`max-md:[&>span:nth-child(2)]:text-[1.6rem] ${className}`}
      detail={
        <>
          <span className="font-semibold">{endpoint.airportCode}</span>{" "}
          <span className="text-muted">{formatDate(endpoint.localTime)}</span>
        </>
      }
    >
      {formatTime(endpoint.localTime)}
    </LabelValue>
  );
}
