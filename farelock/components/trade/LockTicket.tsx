"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { quoteLockAtStrike } from "@/app/(site)/fares/actions";
import Card from "@/components/Card";
import DetailList, { DetailRow } from "@/components/DetailList";
import PillLink, { solidButtonClass } from "@/components/PillLink";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type { FareDetail, Money } from "@/types/fare";
import { QUOTE_REFRESH_EVENT } from "./QuoteTimer";

/** Wait this long after the last keystroke before re-pricing. */
const QUOTE_DEBOUNCE_MS = 350;

/**
 * The order ticket: what locking this fare gets you, what it costs, and the
 * button to buy the lock. Shown to a visitor who does not hold a lock on
 * this fare yet; once they do, HeldLockCard takes its place.
 *
 * The locked fare starts at today's fare and can be edited. Editing
 * re-prices the fee (debounced) via the option model. When the quote timer
 * expires, the fee is re-priced at the current strike.
 *
 * A lock has no length to choose. It runs until the flight departs.
 * FareLocker sells the lock only, never the flight, so there is no
 * "book" button here.
 */
export default function LockTicket({ fare }: { fare: FareDetail }) {
  if (!fare.lock) {
    return (
      <Card className="flex flex-col gap-5">
        <h2 className="text-2xl tracking-[-0.03em]">Lock this fare</h2>
        <p className="text-[13px] leading-normal text-muted">
          We can&rsquo;t offer a lock on this fare right now. Other flights on
          this route may have one.
        </p>
        <PillLink href="/search" className="w-full">
          Back to search
        </PillLink>
      </Card>
    );
  }

  return <LockTicketForm fare={fare} initialFee={fare.lock.fee} />;
}

function LockTicketForm({
  fare,
  initialFee,
}: {
  fare: FareDetail;
  initialFee: Money;
}) {
  const inputId = useId();
  const currency = fare.fare.currency;
  const [draft, setDraft] = useState(centsToDraft(fare.fare.amount));
  const [strikeCents, setStrikeCents] = useState(fare.fare.amount);
  const [fee, setFee] = useState(initialFee);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Pick up the server fee when still locking at today's market fare.
  useEffect(() => {
    if (strikeCents !== fare.fare.amount) return;
    setFee(initialFee);
  }, [initialFee, strikeCents, fare.fare.amount]);

  // Debounced re-price while the locked fare is being edited.
  useEffect(() => {
    const parsed = parseDraftCents(draft);
    if (parsed === null) {
      setQuoteError(null);
      setQuoting(false);
      return;
    }
    if (parsed === strikeCents) {
      setQuoteError(null);
      setQuoting(false);
      return;
    }

    let cancelled = false;
    setQuoting(true);
    setQuoteError(null);
    const handle = window.setTimeout(async () => {
      const next = await fetchQuote(fare, parsed, currency);
      if (cancelled) return;
      applyQuoteResult(next, parsed, setStrikeCents, setFee, setQuoteError, setQuoting);
    }, QUOTE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [
    draft,
    strikeCents,
    currency,
    fare,
  ]);

  // When the quote countdown ends, re-price at the strike currently shown.
  useEffect(() => {
    let cancelled = false;

    const onRefresh = () => {
      const parsed = parseDraftCents(draft);
      if (parsed === null) return;

      setQuoting(true);
      setQuoteError(null);
      void fetchQuote(fare, parsed, currency).then((next) => {
        if (cancelled) return;
        applyQuoteResult(next, parsed, setStrikeCents, setFee, setQuoteError, setQuoting);
      });
    };

    window.addEventListener(QUOTE_REFRESH_EVENT, onRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener(QUOTE_REFRESH_EVENT, onRefresh);
    };
  }, [draft, currency, fare]);

  const lockedFare: Money = { amount: strikeCents, currency };
  const checkoutHref =
    strikeCents === fare.fare.amount
      ? `/checkout?fare=${fare.id}`
      : `/checkout?fare=${fare.id}&strike=${strikeCents}`;

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-2xl tracking-[-0.03em]">Lock this fare</h2>

      <DetailList>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-foreground/10 py-[13px]">
          <label
            htmlFor={inputId}
            className="text-[11px] uppercase tracking-[0.1em] text-muted"
          >
            Locked fare
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-muted" aria-hidden>
              $
            </span>
            <input
              id={inputId}
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(event) => setDraft(sanitizeDraft(event.target.value))}
              aria-invalid={quoteError ? true : undefined}
              className="h-9 w-[7.5rem] rounded-xl border border-foreground/15 bg-pitch px-3 text-right text-[13px] font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            />
          </div>
        </div>
        <DetailRow label="Lock lasts">
          Until departure
          <span className="block font-normal text-muted">
            {formatDate(fare.depart.localTime)},{" "}
            {formatTime(fare.depart.localTime)}
          </span>
        </DetailRow>
        <DetailRow label="Most you can gain">
          {formatMoney({
            amount: Math.floor(lockedFare.amount / 2),
            currency: lockedFare.currency,
          })}
          <span className="block font-normal text-muted">Half the locked fare</span>
        </DetailRow>
      </DetailList>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 rounded-[1.25rem] bg-pitch px-[22px] py-5">
        <span className="pb-1.5 text-[11px] uppercase tracking-[0.1em] text-muted">
          Lock fee, paid today
        </span>
        <span
          className={`text-[2.75rem] leading-none font-extralight tracking-[-0.05em] tabular-nums transition-opacity ${
            quoting ? "opacity-50" : ""
          }`}
        >
          {formatMoney(fee)}
        </span>
      </div>

      {quoteError ? (
        <p role="alert" className="text-[13px] leading-normal font-semibold text-accent">
          {quoteError}
        </p>
      ) : null}

      <Link
        href={checkoutHref}
        aria-disabled={quoting || Boolean(quoteError) || parseDraftCents(draft) === null}
        className={`${solidButtonClass} ${
          quoting || quoteError || parseDraftCents(draft) === null
            ? "pointer-events-none opacity-60"
            : ""
        }`}
      >
        Lock this fare
      </Link>
      <p className="text-center text-xs font-medium text-muted">
        Paid from your wallet
      </p>
    </Card>
  );
}

async function fetchQuote(fare: FareDetail, strikeCents: number, currency: string) {
  return quoteLockAtStrike({
    origin: fare.depart.airportCode,
    destination: fare.arrive.airportCode,
    departureDate: fare.depart.localTime.slice(0, 10),
    flightNumber: fare.flightNumber,
    fareCents: fare.fare.amount,
    strikeCents,
  }).then((result) => ({ result, currency }));
}

function applyQuoteResult(
  {
    result,
    currency,
  }: Awaited<ReturnType<typeof fetchQuote>>,
  strikeCents: number,
  setStrikeCents: (n: number) => void,
  setFee: (fee: Money) => void,
  setQuoteError: (error: string | null) => void,
  setQuoting: (quoting: boolean) => void,
) {
  if ("error" in result) {
    setQuoteError(result.error);
    setQuoting(false);
    return;
  }
  setStrikeCents(strikeCents);
  setFee({ amount: result.feeCents, currency });
  setQuoteError(null);
  setQuoting(false);
}

/** Whole dollars when even, otherwise two decimals — matches formatMoney. */
function centsToDraft(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

/** Digits and at most one decimal point, up to two places. */
function sanitizeDraft(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
}

function parseDraftCents(draft: string): number | null {
  if (!draft || draft === ".") return null;
  const cents = Math.round(Number(draft) * 100);
  if (!Number.isFinite(cents) || !Number.isInteger(cents) || cents <= 0) return null;
  return cents;
}
