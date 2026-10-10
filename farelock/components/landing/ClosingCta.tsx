import Container from "@/components/Container";
import FocusSearchButton from "@/components/FocusSearchButton";
import Label from "@/components/Label";

export default function ClosingCta() {
  return (
    <section className="border-t border-line bg-pitch">
      <Container className="flex flex-col items-start gap-8 py-20 md:py-32">
        <Label>Start here</Label>
        <h2 className="text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.02em]">
          Find a fare
          <br />
          worth locking.
        </h2>
        <p className="max-w-[600px] text-2xl font-light text-soft">
          Searching is free. You only pay if you lock.
        </p>
        <FocusSearchButton>Search fares</FocusSearchButton>
      </Container>
    </section>
  );
}
