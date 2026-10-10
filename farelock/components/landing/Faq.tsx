import { CirclePlusIcon } from "@/components/icons";
import { TBD } from "@/lib/placeholders";
import SplitSection from "./SplitSection";

const questions = [
  {
    question: "What happens if the fare goes up after I lock?",
    answer: `You book at your locked fare. We cover the difference, up to ${TBD.coverLimit}.`,
  },
  {
    question: "What if the fare drops instead?",
    answer: "You book at the new, lower fare. Your only cost is the lock fee.",
  },
  {
    question: "Do I get the fee back if I never book?",
    answer: TBD.refundTerms,
  },
  {
    question: "How is the lock fee worked out?",
    answer:
      "A lock is priced like an option. The fee depends on how much the fare tends to move, how long you lock it for, and how close the flight is.",
  },
];

/* Built on <details>, so it opens and closes without any JavaScript. */
export default function Faq() {
  return (
    <SplitSection id="faq" label="FAQ">
      <div className="flex flex-col gap-12">
        <h2 className="text-[2.5rem] leading-[1.2] tracking-[-0.02em]">
          Questions people ask first.
        </h2>
        <div className="border-b border-line">
          {questions.map((item) => (
            <details key={item.question} className="group border-t border-line">
              <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-2xl tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
                {item.question}
                <CirclePlusIcon className="h-6 w-6 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="max-w-[600px] pb-6 text-xl leading-[1.3] text-soft">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </SplitSection>
  );
}
