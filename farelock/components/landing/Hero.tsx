import Container from "@/components/Container";
import DitherWave from "@/components/DitherWave";
import Intro from "@/components/Intro";

export default function Hero() {
  return (
    <section className="relative flex min-h-[34rem] items-center overflow-hidden lg:min-h-[max(34rem,calc(100svh-5.75rem))]">
      <DitherWave />
      <Container className="relative py-16">
        <Intro />
      </Container>
    </section>
  );
}
