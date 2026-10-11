import Container from "@/components/Container";
import FocusSearchButton from "@/components/FocusSearchButton";
import Label from "@/components/Label";

export default function ClosingCta() {
  return (
    <section className="border-t border-line bg-pitch">
      <Container className="flex flex-col items-start gap-8 py-20 max-md:gap-6 max-md:py-[4.5rem] md:py-32">
        <Label>Start here</Label>
        <h2 className="text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.02em]">
          Find a fare
          <br />
          worth a FareLock.
        </h2>
        <p className="max-w-[600px] text-2xl font-light text-soft max-md:text-[1.2rem]">
          Searching is free. You only pay if you buy a FareLock.
        </p>
        <FocusSearchButton>Search fares</FocusSearchButton>
      </Container>
    </section>
  );
}
