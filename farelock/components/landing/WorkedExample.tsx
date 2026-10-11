import Label from "@/components/Label";
import { TBD } from "@/lib/placeholders";
import SplitSection from "./SplitSection";

const terms = [
  { label: "You booked at", value: TBD.example.lockedFare },
  { label: "FareLock fee", value: TBD.example.lockFee },
  { label: "FareLock lasts", value: "Until departure" },
  { label: "Fare later", value: TBD.example.fareLater },
];

const outcomes = [
  {
    label: "If the fare goes down",
    body: `You exercise the FareLock and we pay the drop, up to ${TBD.coverLimit}.`,
  },
  {
    label: "If the fare goes up",
    body: "The FareLock pays nothing. You already have your ticket.",
  },
  {
    label: "If you do nothing",
    body: "At departure we settle the FareLock for you — same rules, no action needed.",
  },
];

export default function WorkedExample() {
  return (
    <SplitSection label="A worked example">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-[2.5rem] leading-[1.2] tracking-[-0.02em]">
            What one FareLock looks like.
          </h2>
          <p className="max-w-[600px] text-xl leading-[1.3] text-soft">
            You already booked the flight. Here is what a FareLock does if the
            fare moves — with numbers from a real route.
          </p>
        </div>

        <div>
          <p className="pb-4 text-2xl tracking-[-0.02em]">
            Atlanta (ATL) to Los Angeles (LAX)
          </p>
          <dl>
            {terms.map((term) => (
              <div
                key={term.label}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line py-4"
              >
                <dt className="text-[0.7rem] uppercase tracking-[0.05em] text-muted">
                  {term.label}
                </dt>
                <dd className="text-xl">{term.value}</dd>
              </div>
            ))}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-foreground pt-5">
              <dt className="text-[0.7rem] uppercase tracking-[0.05em]">
                Paid to You
              </dt>
              <dd className="text-[2.5rem] leading-none tracking-[-0.02em]">
                {TBD.example.saving}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {outcomes.map((outcome) => (
            <div
              key={outcome.label}
              className="flex flex-col gap-3 border-t border-line pt-4"
            >
              <Label>{outcome.label}</Label>
              <p className="text-xl leading-[1.3] text-soft">{outcome.body}</p>
            </div>
          ))}
        </div>
      </div>
    </SplitSection>
  );
}
