import type { Metadata } from "next";
import TeamRow from "@/components/about/TeamRow";
import Container from "@/components/Container";
import Label from "@/components/Label";
import PlaneFollow from "@/components/PlaneFollow";
import { TEAM, TEAM_INTRO } from "@/lib/team";

export const metadata: Metadata = {
  title: "About | FareLocker",
  description: "The team behind FareLocker.",
};

/**
 * /about: the people who built FareLocker, one row each, photos on
 * alternating sides. Who they are is in lib/team.ts.
 *
 * `relative` on <main> matters: the planes (PlaneFollow) fly over this
 * element and measure their positions from its corner.
 */
export default function AboutPage() {
  return (
    <main className="relative flex-1">
      <PlaneFollow />

      <section
        aria-labelledby="about-title"
        className="flex min-h-[40rem] items-center border-b border-line"
      >
        {/* items-start: each line is only as wide as its words, so the planes
            dim behind the heading itself and not the whole width of the page. */}
        <Container className="flex flex-col items-start gap-6 py-20">
          <Label>About</Label>
          <h1
            id="about-title"
            data-plane-quiet
            className="text-[clamp(4rem,10vw,9rem)] leading-[0.9] tracking-[-0.02em] uppercase"
          >
            Meet
            <br />
            the team
          </h1>
          <p data-plane-quiet className="mt-2 max-w-[440px] text-[1.05rem] text-soft">
            {TEAM_INTRO}
          </p>
        </Container>
      </section>

      <Container className="pt-4 pb-16">
        {TEAM.map((member, index) => (
          // The list never reorders while the page is open, so its position
          // is a safe key (two placeholder names can be the same).
          <TeamRow key={index} member={member} index={index} />
        ))}
      </Container>
    </main>
  );
}
