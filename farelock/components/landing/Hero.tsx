import Container from "@/components/Container";
import Intro from "@/components/Intro";
import PlaneFlyby from "@/components/PlaneFlyby";
import type { TextStop } from "@/lib/plane-flyby";

/*
 * Where the hero text ends, top to bottom, so the plane dims behind it:
 * nothing in the top band, then "NEVER", the wider "OVERPAY", the paragraph
 * and button, then nothing. Adjust if the headline's size or wording changes.
 */
const HERO_TEXT: TextStop[] = [
  [0.1, -0.1],
  [0.16, 0.44],
  [0.36, 0.44],
  [0.42, 0.58],
  [0.56, 0.58],
  [0.62, 0.47],
  [0.84, 0.47],
  [0.9, -0.1],
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[34rem] items-center overflow-hidden lg:min-h-[max(34rem,calc(100svh-5.75rem))]">
      <PlaneFlyby textStops={HERO_TEXT} />
      <Container className="relative py-16">
        <Intro />
      </Container>
    </section>
  );
}
