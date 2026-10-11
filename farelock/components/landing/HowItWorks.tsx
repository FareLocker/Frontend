import Container from "@/components/Container";
import Label from "@/components/Label";

const steps = [
  {
    title: "Book your flight",
    body: "Buy the ticket as you normally would for your route and dates.",
  },
  {
    title: "Buy a FareLock",
    body: "Pay a one-time fee to protect today’s price until departure.",
  },
  {
    title: "Exercise when it pays",
    body: "Cash out your FareLock anytime before the flight, or let it settle automatically at departure.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line">
      <Container className="flex flex-col gap-10 py-16 max-md:gap-8 max-md:py-12">
        <Label>How it works</Label>
        <ol className="grid gap-8 max-md:gap-7 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 max-md:gap-2.5">
              <Label className="text-muted">
                {String(index + 1).padStart(2, "0")}
              </Label>
              <h3 className="text-[1.75rem] leading-[1.15] tracking-[-0.02em] max-md:text-2xl">
                {step.title}
              </h3>
              <p className="text-xl leading-[1.3] text-soft max-md:text-[1.1rem] max-md:leading-[1.35]">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
