"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buyLock } from "@/app/(checkout)/checkout/actions";
import { solidButtonClass } from "@/components/PillLink";
import { formatMoney } from "@/lib/format";
import type { Money } from "@/types/fare";

export default function LockPurchasePanel({
  fareId,
  initialFee,
  balance,
}: {
  fareId: string;
  initialFee: Money;
  balance: Money | null;
}) {
  const [state, formAction, pending] = useActionState(buyLock, null);
  const fee = { ...initialFee, amount: state?.feeCents ?? initialFee.amount };
  const short = balance ? Math.max(0, fee.amount - balance.amount) : 0;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-[1.25rem] bg-pitch px-[22px] py-5">
        <span className="pb-1.5 text-[11px] uppercase tracking-[0.1em] text-muted">
          Total
        </span>
        <span className="text-[2.75rem] leading-none font-extralight tracking-[-0.05em] tabular-nums">
          {formatMoney(fee)}
        </span>
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="text-[13px] leading-normal font-semibold text-accent"
        >
          {state.error}
        </p>
      ) : null}

      {short > 0 ? (
        <div className="flex flex-col gap-3">
          <p
            role="status"
            className="text-[13px] leading-normal font-semibold text-accent"
          >
            Your wallet is{" "}
            {formatMoney({ amount: short, currency: fee.currency })} short of
            this lock.
          </p>
          <Link
            href="/wallet/checkout"
            className={`${solidButtonClass} w-full`}
          >
            Add funds
          </Link>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="fareId" value={fareId} />
          <input type="hidden" name="expectedFeeCents" value={fee.amount} />
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-normal text-soft">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-accent"
            />
            <span>
              I have read the{" "}
              <Link
                href="/lock-terms"
                className="text-foreground underline underline-offset-2"
              >
                lock terms
              </Link>
            </span>
          </label>
          <button
            type="submit"
            disabled={pending}
            className={`${solidButtonClass} w-full disabled:cursor-wait disabled:opacity-60`}
          >
            {pending ? "Locking fare…" : `Pay ${formatMoney(fee)} and lock`}
          </button>
        </form>
      )}
    </>
  );
}
