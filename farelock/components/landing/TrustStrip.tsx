import Container from "@/components/Container";
import Label from "@/components/Label";
import { TBD } from "@/lib/placeholders";

const points = [
  {
    label: "Live fares",
    body: "Fare data via Duffel, checked against the airline before you pay.",
  },
  {
    label: "Secure payment",
    body: `Card payments by ${TBD.paymentProvider}.`,
  },
  {
    label: "Clear terms",
    body: "Every lock shows its fee, length and limit before you pay.",
  },
];

export default function TrustStrip() {
  return (
    <section className="border-t border-line">
      <Container className="grid gap-8 py-16 md:grid-cols-3">
        {points.map((point) => (
          <div key={point.label} className="flex flex-col gap-6">
            <Label>{point.label}</Label>
            <p className="text-xl leading-[1.3] text-soft">{point.body}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}
