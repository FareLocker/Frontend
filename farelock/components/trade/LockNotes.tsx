import Card from "@/components/Card";
import PillLink from "@/components/PillLink";
import { formatDate, formatTime } from "@/lib/format";
import { TBD } from "@/lib/placeholders";
import type { Lock } from "@/types/lock";

const heading = "text-[1.1rem] font-semibold tracking-[-0.02em]";
const body = "text-[13px] leading-normal text-muted";

/**
 * "If you don't exercise": tells the holder of an open lock that it is
 * exercised for them when the flight departs, so doing nothing never loses
 * a payout.
 */
export function AutoExerciseCard({ lock }: { lock: Lock }) {
  return (
    <Card size="md" className="flex flex-col gap-2">
      <h2 className={heading}>If you don&rsquo;t exercise</h2>
      <p className={body}>
        When the flight departs, {formatDate(lock.departs)} at{" "}
        {formatTime(lock.departs)}, the lock is exercised for you. If the fare
        is below your locked fare then, the difference goes into your wallet.
        If not, it pays nothing. {TBD.refundTerms}
      </p>
    </Card>
  );
}

/** "Need help?": where a member with a lock goes with a question. */
export function LockHelpCard() {
  return (
    <Card size="md" className="flex flex-col gap-2">
      <h2 className={heading}>Need help?</h2>
      <p className={body}>Questions about this lock or a payout.</p>
      {/* LATER (support): /support has not been built. */}
      <PillLink href="/support" size="sm" className="mt-1.5 self-start">
        Contact support
      </PillLink>
    </Card>
  );
}
