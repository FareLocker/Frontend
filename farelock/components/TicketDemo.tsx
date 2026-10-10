// components/TicketDemo.tsx
"use client";

import { useState } from "react";
import TearTicket from "@/components/TearTicket";

// PLACEHOLDER: swap for the signed-in user's account data once the backend exists.
const ticket = {
  image: "/ticket-image.svg",
  name: "Demo traveller",
  memberNumber: "FL-004821",
  tier: "Member",
  homeAirport: "ATL",
  memberSince: "Oct 2026",
  activeLocks: "3",
  totalSaved: "$142",
};

function Field({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.65rem] uppercase tracking-[0.08em] opacity-60">{label}</span>
      <span className={large ? "text-4xl leading-none tracking-[-0.03em]" : "text-lg leading-none"}>
        {value}
      </span>
    </div>
  );
}

export default function TicketDemo() {
  const [torn, setTorn] = useState(false);

  return (
    <TearTicket
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
      image={ticket.image}
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
  );
}
