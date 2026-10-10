import Card from "@/components/Card";
import DetailList, { DetailRow } from "@/components/DetailList";
import { formatDate, formatDuration, formatTime } from "@/lib/format";
import type { FareDetail, FlightEndpoint } from "@/types/fare";

export const cardHeadingClass =
  "pb-3.5 text-[1.1rem] font-semibold tracking-[-0.02em]";

/** The facts about the flight itself. */
export default function FlightDetailsCard({ fare }: { fare: FareDetail }) {
  return (
    <Card>
      <h2 className={cardHeadingClass}>Flight details</h2>
      <DetailList>
        <DetailRow label="Departs">
          <Stop endpoint={fare.depart} />
        </DetailRow>
        <DetailRow label="Arrives">
          <Stop endpoint={fare.arrive} />
        </DetailRow>
        <DetailRow label="Duration">
          {formatDuration(fare.durationMinutes)}
        </DetailRow>
        <DetailRow label="Aircraft">{fare.aircraft}</DetailRow>
        <DetailRow label="Bags">{fare.baggage}</DetailRow>
        <DetailRow label="Changes and refunds">{fare.fareRules}</DetailRow>
      </DetailList>
    </Card>
  );
}

/** Time and date on one line, the airport underneath. */
function Stop({ endpoint }: { endpoint: FlightEndpoint }) {
  return (
    <>
      {formatTime(endpoint.localTime)} · {formatDate(endpoint.localTime)}
      <span className="block font-normal text-muted">
        {endpoint.airportName} ({endpoint.airportCode})
      </span>
    </>
  );
}
