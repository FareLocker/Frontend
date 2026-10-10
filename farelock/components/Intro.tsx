import { CirclePlusIcon } from "./icons";
import Label from "./Label";
import PillLink from "./PillLink";

/** The headline block at the top of the landing page. */
export default function Intro() {
  return (
    <div>
      <Label className="mb-2">Fare protection</Label>
      <h1 className="mb-8 text-[clamp(4rem,12vw,11rem)] leading-[0.9] tracking-[-0.02em] uppercase">
        Never
        <br />
        overpay
      </h1>
      <p className="mb-12 max-w-[600px] text-2xl font-light text-soft">
        Lock today&apos;s fare for a small fee. If the price goes up, you still
        pay the locked price. If it goes down, you pay less.
      </p>
      <PillLink href="#how-it-works" size="sm" className="bg-background/70">
        How a lock works
        <CirclePlusIcon />
      </PillLink>
    </div>
  );
}
