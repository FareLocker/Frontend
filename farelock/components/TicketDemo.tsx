// components/TicketDemo.tsx
"use client";

import { useState } from "react";
import TearTicket from "@/components/TearTicket";

/** What the ticket prints. Plain strings, already formatted by the page. */
export type TicketFields = {
  name: string;
  memberNumber: string;
  tier: string;
  homeAirport: string;
  memberSince: string;
  activeLocks: string;
  totalSaved: string;
};

function Field({
  label,
  value,
  large = false,
  small = false,
}: {
  label: string;
  value: string;
  large?: boolean;
  /** The phone stub's narrower column. */
  small?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[0.65rem] uppercase tracking-[0.08em] opacity-60">{label}</span>
      <span
        className={
          large
            ? "text-4xl leading-none tracking-[-0.03em] [overflow-wrap:anywhere]"
            : small
              ? "text-[15px] leading-tight [overflow-wrap:anywhere]"
              : "text-lg leading-none [overflow-wrap:anywhere]"
        }
      >
        {value}
      </span>
    </div>
  );
}

/*
 * The ticket's shape is built from fixed numbers (width, height, stub size)
 * and then scaled to fit, so one set of numbers cannot suit both a desktop and
 * a phone: the desktop one shrinks to unreadable on a phone. So there are two,
 * from the same fields and one `torn` state: the desktop ticket from md up,
 * and a phone ticket (420 x 330, 104px stub) below it. Only one is ever shown
 * (the other is display:none), so the page never has two in its a11y tree.
 */
export default function TicketDemo({ ticket }: { ticket: TicketFields }) {
  const [torn, setTorn] = useState(false);

  return (
    <>
    <TearTicket
      className="max-md:hidden"
      torn={torn}
      onTear={() => setTorn(true)}
      width={820}
      height={380}
      stubSize={220}
      rotate={0}
      tiltMax={14}
      tiltReach={400}
      parallax={12}
      perspective={800}
      image="/ticket-image.svg"
      imageAlt=""
      scrim
      ariaLabel="Tear off your member stub"
      stub={
        <div className="flex h-full flex-col justify-between p-7">
          <Field label="Member no." value={ticket.memberNumber} />
          <Field label="Class" value={ticket.tier} />
          {/* Decorative barcode */}
          <div
            aria-hidden
            className="h-10 w-full bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_4px,currentColor_4px_5px,transparent_5px_8px)]"
          />
        </div>
      }
    >
      <div className="flex h-full flex-col justify-end gap-5 p-8">
        <Field label="Passenger" value={ticket.name} large />
        <div className="grid grid-cols-4 gap-4">
          <Field label="Home" value={ticket.homeAirport} />
          <Field label="Since" value={ticket.memberSince} />
          <Field label="Locks" value={ticket.activeLocks} />
          <Field label="Saved" value={ticket.totalSaved} />
        </div>
      </div>
    </TearTicket>

    {/* Phone: the same ticket, sized for a narrow screen. */}
    <TearTicket
      className="md:hidden"
      torn={torn}
      onTear={() => setTorn(true)}
      width={420}
      height={330}
      stubSize={104}
      rotate={0}
      tiltMax={10}
      tiltReach={240}
      parallax={8}
      perspective={800}
      image="/ticket-image.svg"
      imageAlt=""
      scrim
      ariaLabel="Tear off your member stub"
      stub={
        <div className="flex h-full flex-col justify-between p-4">
          <Field label="Member no." value={ticket.memberNumber} small />
          <Field label="Class" value={ticket.tier} small />
          <div
            aria-hidden
            className="h-8 w-full bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_4px,currentColor_4px_5px,transparent_5px_8px)]"
          />
        </div>
      }
    >
      <div className="flex h-full flex-col justify-end gap-4 p-5">
        <Field label="Passenger" value={ticket.name} large />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Home" value={ticket.homeAirport} />
          <Field label="Since" value={ticket.memberSince} />
          <Field label="Locks" value={ticket.activeLocks} />
          <Field label="Saved" value={ticket.totalSaved} />
        </div>
      </div>
    </TearTicket>
    </>
  );
}
