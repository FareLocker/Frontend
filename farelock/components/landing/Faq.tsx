import { CirclePlusIcon } from "@/components/icons";
import { TBD } from "@/lib/placeholders";
import SplitSection from "./SplitSection";

const questions = [
  {
    question: "What happens if the fare goes up after I buy a FareLock?",
    answer:
      "The FareLock pays nothing. You already have your ticket, so a rising fare does not hurt you.",
  },
  {
    question: "What if the fare drops instead?",
    answer: `You exercise the FareLock and we pay the drop, up to 50% of the fare. Your only other cost is the FareLock fee.`,
  },
  {
    question: "What if I never exercise?",
    answer:
      "At departure we settle the FareLock for you — same payout rules, no action needed.",
  },
  {
    question: "How is the FareLock fee worked out?",
    answer:
      "A FareLock is priced like an option. The fee depends on how much the fare tends to move and how long is left until the flight.",
  },
];

/* Built on <details>, so it opens and closes without any JavaScript. */
export default function Faq() {
  return (
    <SplitSection id="faq" label="FAQ">
      <div className="flex flex-col gap-12 max-md:gap-8">
        <h2 className="text-[2.5rem] leading-[1.2] tracking-[-0.02em] max-md:text-[1.9rem] max-md:leading-[1.15]">
          Questions people ask first.
        </h2>
        <div className="border-b border-line">
          {questions.map((item) => (
            <details key={item.question} className="group border-t border-line">
              <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-2xl tracking-[-0.02em] max-md:min-h-[68px] max-md:py-3.5 max-md:text-[1.15rem] max-md:leading-[1.25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
                {item.question}
                <CirclePlusIcon className="h-6 w-6 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="max-w-[600px] pb-6 text-xl leading-[1.3] text-soft max-md:text-[1.1rem] max-md:leading-[1.35]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </SplitSection>
  );
}
