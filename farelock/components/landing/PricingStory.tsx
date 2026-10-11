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
      <h2 className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.2] tracking-[-0.02em] max-md:text-[1.6rem] max-md:leading-[1.22]">
        A FareLock is an <Dim>American option</Dim> on a fare you already paid:
        a <Dim>set strike</Dim>, exercisable any time before a{" "}
        <Dim>deadline</Dim> at departure. So we price it with an option model,
        not a <Dim>flat markup</Dim>.
      </h2>
    </SplitSection>
  );
}
