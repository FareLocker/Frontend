"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { withdraw, type WithdrawState } from "@/app/(site)/account/actions";
import FormError from "@/components/auth/FormError";
import { pillClass, solidButtonClass } from "@/components/PillLink";
import TextField from "@/components/TextField";
import { formatMoney } from "@/lib/format";
import type { Money } from "@/types/fare";

/**
 * "Withdraw" beside "Add funds" on the account page. It opens a dialog to
 * take money out of the wallet; any amount up to the balance is allowed.
 *
 * The dialog is the browser's own <dialog>, as in ExerciseLock: showModal()
 * makes it modal, keeps focus inside and closes on Escape. It closes itself
 * once a withdrawal goes through; the account page is revalidated, so the
 * balance and the Activity list update behind it.
 */
export default function WithdrawButton({
  balance,
}: {
  /** The wallet balance, or null if it couldn't be read. */
  balance: Money | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, formAction, pending] = useActionState<WithdrawState, FormData>(
    withdraw,
    null,
  );

  // Each submit returns a new state object, so this runs once per success.
  useEffect(() => {
    if (state && "ok" in state) dialogRef.current?.close();
  }, [state]);

  // Nothing to withdraw, or the balance is unknown: show the button, but off.
  const empty = !balance || balance.amount <= 0;
  const max = balance ? (balance.amount / 100).toFixed(2) : "0";

  return (
    <>
      <button
        type="button"
        disabled={empty}
        onClick={() => dialogRef.current?.showModal()}
        title={empty ? "Your wallet is empty" : undefined}
        className={`${pillClass.sm} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
      >
        Withdraw
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // A click on the backdrop lands on the dialog itself: close it.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-[calc(100dvh-3rem)] w-[min(440px,calc(100vw-3rem))] overflow-y-auto rounded-[2rem] border border-foreground/15 bg-card text-foreground backdrop:bg-pitch/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-5 p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <h2 id={titleId} className="text-2xl tracking-[-0.03em]">
                Withdraw funds
              </h2>
              <p className="text-[13px] text-muted">
                Available: {balance ? formatMoney(balance) : "—"}
              </p>
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

          <form action={formAction} className="flex flex-col gap-5">
            <TextField
              label="Amount (USD)"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              max={max}
              step="0.01"
              defaultValue={max}
              required
              hint="Any amount up to your balance."
            />
            {state && "error" in state ? <FormError>{state.error}</FormError> : null}
            <button
              type="submit"
              disabled={pending}
              className={`${solidButtonClass} w-full disabled:cursor-wait disabled:opacity-60`}
            >
              {pending ? "Withdrawing…" : "Withdraw"}
            </button>
            <p className="text-center text-xs leading-normal text-muted">
              Demo wallet. The money leaves your FareLocker balance; nothing is
              sent to a bank.
            </p>
          </form>
        </div>
      </dialog>
    </>
  );
}
