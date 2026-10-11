import type { ReactNode } from "react";
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
    <SplitSection id="pricing" label="How the fee is set">
      <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.2] tracking-[-0.02em]">
        Priced like an option, <Dim>because it is one.</Dim> A lock is the
        right to buy a ticket at a <Dim>set price</Dim> before a{" "}
        <Dim>deadline</Dim>. That is an option, so we price it with an option
        model instead of a <Dim>flat markup</Dim>.
      </h2>
    </SplitSection>
  );
}
