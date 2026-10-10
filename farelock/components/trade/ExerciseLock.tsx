"use client";

import { useId, useRef } from "react";
import DetailList, { DetailRow } from "@/components/DetailList";
import Label from "@/components/Label";
import { pillClass, solidButtonClass, solidButtonSmallClass } from "@/components/PillLink";
import { TBD } from "@/lib/placeholders";

/**
 * The figures the confirmation shows, already formatted for display. Build
 * one with exerciseSummary() in lib/locks.ts.
 */
export type ExerciseSummary = {
  /** Which lock this is, for the request that exercises it. */
  lockId: string;
  /** e.g. "New York to Lisbon · Tue 12 Jan" */
  flight: string;
  lockedFare: string;
  fareNow: string;
  /** How far the fare has dropped below the locked fare. */
  difference: string;
  /** Half the locked fare. */
  maxGain: string;
  /** What the visitor receives: the difference, up to the most they can gain. */
  payout: string;
};

/**
 * The "Exercise lock" button and the confirmation that opens over the page
 * when it is pressed.
 *
 * The confirmation is the browser's own <dialog>, opened with showModal().
 * That gives the right behaviour without extra code: it sits in the middle
 * of the screen over a dimmed page, keeps the keyboard inside it, and closes
 * on Escape. A <form method="dialog"> closes it when one of its buttons is
 * pressed.
 *
 * BACKEND NOTE (COMPLETED02): POST /locks/{lock_id}/exercise (bearer token)
 * exists. It returns { status, settle_fare_cents, payout_cents,
 * balance_cents, ... } or 422 with code fare_not_below_strike,
 * lock_not_open, past_exercise_window or fare_unavailable. Not wired yet.
 *
 * LATER (exercise): nothing is sent anywhere yet, so "Exercise and receive"
 * only closes the dialog. When the backend exists:
 *   1. Give that button's form a server action that exercises the lock, in
 *      place of method="dialog".
 *   2. Have the backend fix the payout for a short time when the dialog
 *      opens, and show how long is left, because the fare can move while the
 *      visitor is reading.
 *   3. Afterwards, refresh the page. The lock's status is no longer "open",
 *      so the fare page shows it as ended (LockOutcomeCard) and My locks
 *      moves it out of the active ones.
 */
export default function ExerciseLock({
  summary,
  size = "lg",
  label = "Exercise lock",
}: {
  summary: ExerciseSummary;
  /**
   * "lg": the full-width main button, as on the fare page.
   * "md": a smaller one that sits in a row of buttons, as on My locks.
   */
  size?: "lg" | "md";
  /** The opening button's words. */
  label?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={size === "lg" ? `${solidButtonClass} w-full` : solidButtonSmallClass}
      >
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // The dialog has no padding of its own, so a click that lands on it,
        // rather than on something inside it, was on the dimmed page: close.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-[calc(100dvh-3rem)] w-[min(480px,calc(100vw-3rem))] overflow-y-auto rounded-[2rem] border border-foreground/15 bg-card text-foreground backdrop:bg-pitch/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-5 p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <Label>Exercise lock</Label>
              <h2 id={titleId} className="text-2xl tracking-[-0.03em]">
                Exercise your lock?
              </h2>
              <p className="text-[13px] text-muted">{summary.flight}</p>
            </div>
            <form method="dialog">
              <button
                type="submit"
                aria-label="Close"
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-foreground/10 transition-colors duration-200 hover:bg-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </form>
          </div>

          <DetailList>
            <DetailRow label="Locked fare">{summary.lockedFare}</DetailRow>
            <DetailRow label="Fare now">{summary.fareNow}</DetailRow>
            <DetailRow label="Difference">{summary.difference}</DetailRow>
            <DetailRow label="Most you can gain">
              {summary.maxGain}
              <span className="block font-normal text-muted">Half the locked fare</span>
            </DetailRow>
          </DetailList>

          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-[1.25rem] bg-pitch px-[22px] py-5">
            <span className="pb-1.5 text-[11px] uppercase tracking-[0.1em] text-muted">
              You receive, into your wallet
            </span>
            <span className="text-[2.75rem] leading-none font-extralight tracking-[-0.05em] tabular-nums">
              {summary.payout}
            </span>
          </div>

          <p className="rounded-2xl bg-raised px-[18px] py-3.5 text-[13px] leading-normal text-soft">
            Exercising ends this lock. It can&rsquo;t be undone.
          </p>

          <form method="dialog" className="flex flex-col gap-3">
            {/* Goes with the form once it has a server action. */}
            <input type="hidden" name="lockId" value={summary.lockId} />
            <button type="submit" className={`${solidButtonClass} w-full`}>
              Exercise and receive {summary.payout}
            </button>
            <button type="submit" className={`${pillClass.md} w-full cursor-pointer`}>
              Keep my lock
            </button>
          </form>

          <p className="text-center text-xs leading-normal text-muted">
            Payout held for {TBD.quoteHold}. After that we re-check the fare.
          </p>
        </div>
      </dialog>
    </>
  );
}
