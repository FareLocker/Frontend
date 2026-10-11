import ClosingCta from "@/components/landing/ClosingCta";
import Faq from "@/components/landing/Faq";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingStory from "@/components/landing/PricingStory";
import WorkedExample from "@/components/landing/WorkedExample";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <HowItWorks />
      <WorkedExample />
      <PricingStory />
      <Faq />
      <ClosingCta />
    </main>
  );
}
