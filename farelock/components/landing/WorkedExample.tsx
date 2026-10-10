import Label from "@/components/Label";
import { TBD } from "@/lib/placeholders";
import SplitSection from "./SplitSection";

const terms = [
  { label: "Locked fare", value: TBD.example.lockedFare },
  { label: "Lock fee", value: TBD.example.lockFee },
  { label: "Lock lasts", value: TBD.lockLength },
  { label: "Fare on booking day", value: TBD.example.fareAtBooking },
];

const outcomes = [
  {
    label: "If the fare goes up",
    body: `You book at your locked fare. We cover the difference, up to ${TBD.coverLimit}.`,
  },
  {
    label: "If the fare goes down",
    body: "You book at the new, lower fare. Your only cost is the lock fee.",
  },
  {
    label: "If you don't book",
    body: `The lock expires. ${TBD.refundTerms}`,
  },
];

export default function WorkedExample() {
  return (
    <SplitSection label="A worked example">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-[2.5rem] leading-[1.2] tracking-[-0.02em]">
            What one lock looks like.
          </h2>
          <p className="max-w-[600px] text-xl leading-[1.3] text-soft">
            One real route, with the numbers filled in, so the payoff is clear
            before anyone pays.
          </p>
        </div>

        <div>
          <p className="pb-4 text-2xl tracking-[-0.02em]">
            New York (JFK) to Lisbon (LIS)
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
                You saved
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
