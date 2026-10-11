"use client";

import { useActionState, useId, useRef } from "react";
import { deleteAccount, type DeleteAccountState } from "@/app/(site)/account/actions";
import FormError from "@/components/auth/FormError";
import PasswordField from "@/components/auth/PasswordField";
import { pillClass } from "@/components/PillLink";

/*
 * The palette has no "danger" colour yet; this is the red the team's first
 * log in form used for errors. Swap it for a token if one is added.
 */
const danger = "#ff6b6b";

/**
 * "Delete account" on the account page. It opens a dialog that says what
 * will be lost and asks for the member's password before anything happens.
 *
 * The dialog is the browser's own <dialog> (as in WithdrawButton and
 * ExerciseLock): modal, keeps focus inside, closes on Escape. The password
 * goes to the deleteAccount server action, which sends it to the backend's
 * DELETE /auth/me. The backend checks it, and refuses while the wallet has
 * money in it or a lock is still running; its reason is shown here.
 */
export default function DeleteAccountButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, formAction, pending] = useActionState<DeleteAccountState, FormData>(
    deleteAccount,
    null,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        style={{ borderColor: danger, color: danger }}
        className={`${pillClass.sm} cursor-pointer hover:opacity-80`}
      >
        Delete account
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // A click on the backdrop lands on the dialog itself: close it.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-auto max-h-[calc(100dvh-3rem)] w-[min(460px,calc(100vw-3rem))] overflow-y-auto rounded-[2rem] border border-foreground/15 bg-card text-foreground backdrop:bg-pitch/60 backdrop:backdrop-blur-sm max-md:mx-0 max-md:mt-auto max-md:mb-0 max-md:max-h-[85dvh] max-md:w-full max-md:max-w-full max-md:rounded-none max-md:rounded-t-3xl max-md:border-x-0 max-md:border-b-0"
      >
        <div className="flex flex-col gap-5 p-7 max-md:px-5 max-md:pt-6 max-md:pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-2xl tracking-[-0.03em]">
              Delete your account?
            </h2>
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

          <div className="flex flex-col gap-2 rounded-2xl bg-raised px-[18px] py-4 text-[13px] leading-normal text-soft">
            <p className="font-semibold text-foreground">This can&apos;t be undone.</p>
            <p>
              Your account, locks and activity will be deleted, and FareLocker
              will stop texting your phone.
            </p>
            <p>
              You can only delete it once your wallet is at $0 and none of your
              locks are still running.
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-5">
            <PasswordField
              label="Enter your password to confirm"
              autoComplete="current-password"
            />
            {/* On success the action signs the member out and redirects home. */}
            {state?.error ? <FormError>{state.error}</FormError> : null}
            <button
              type="submit"
              disabled={pending}
              style={{ backgroundColor: danger }}
              className="flex min-h-[60px] w-full cursor-pointer items-center justify-center rounded-full px-6 text-[1.05rem] font-semibold tracking-[-0.01em] text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete my account"}
            </button>
          </form>
          <form method="dialog">
            <button type="submit" className={`${pillClass.md} w-full cursor-pointer`}>
              Keep my account
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
