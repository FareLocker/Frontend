import Card from "@/components/Card";
import DetailList, { DetailRow } from "@/components/DetailList";
import PillLink from "@/components/PillLink";
import { formatDaysAway, formatWeeklyMove } from "@/lib/format";
import type { FareDetail } from "@/types/fare";
import { cardHeadingClass } from "./FlightDetailsCard";

/**
 * Explains the lock fee in plain terms: the two things that set it.
 * A lock runs until the flight departs, so its length is the time left.
 */
export default function FeeDriversCard({
  fare,
  daysAway,
}: {
  fare: FareDetail;
  /** Whole days until the flight departs. */
  daysAway: number;
}) {
  return (
    <Card className="flex flex-col">
      <h2 className={cardHeadingClass}>What drives this fee</h2>
      <DetailList>
        <DetailRow label="How much this fare moves">
          {formatWeeklyMove(fare.weeklyMovePercent)}
        </DetailRow>
        <DetailRow label="How long the lock runs">
          {daysAway > 0
            ? `${formatDaysAway(daysAway)}, until departure`
            : "Until departure today"}
        </DetailRow>
      </DetailList>
      <p className="border-t border-foreground/10 pt-4 text-[13px] leading-normal text-muted">
        A lock is priced like an option: the more a fare tends to move, and the
        longer there is until the flight, the more the lock is worth.
      </p>
      <PillLink href="/#pricing" size="sm" className="mt-3 self-start">
        How we price a lock
      </PillLink>
    </Card>
  );
}
