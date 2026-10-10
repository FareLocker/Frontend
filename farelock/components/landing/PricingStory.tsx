import type { ReactNode } from "react";
import { CirclePlusIcon } from "@/components/icons";
import PillLink from "@/components/PillLink";
import SplitSection from "./SplitSection";

/** A dimmed phrase inside the big copy that lights up on hover. */
function Dim({ children }: { children: ReactNode }) {
  return (
    <span className="text-faint transition-colors duration-300 hover:text-foreground">
      {children}
    </span>
  );
}

export default function PricingStory() {
  return (
    <SplitSection label="How the fee is set" ruleAbove={false}>
      <div className="flex flex-col items-start gap-10">
        <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.2] tracking-[-0.02em]">
          Priced like an option, <Dim>because it is one.</Dim> A lock is the
          right to buy a ticket at a <Dim>set price</Dim> before a{" "}
          <Dim>deadline</Dim>. That is an option, so we price it with an option
          model instead of a <Dim>flat markup</Dim>.
        </h2>

        <PillLink href="/how-it-works" size="sm">
          See how we price a lock
          <CirclePlusIcon />
        </PillLink>

        {/* TODO: replace with the fare price tree diagram. */}
        <div className="flex h-[280px] items-center justify-center self-stretch border border-dashed border-foreground/40 p-4 text-center text-[0.7rem] uppercase tracking-[0.05em] text-muted">
          [ Diagram: fare price tree ]
        </div>
      </div>
    </SplitSection>
  );
}
