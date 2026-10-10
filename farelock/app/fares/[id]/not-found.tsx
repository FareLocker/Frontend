import Label from "@/components/Label";
import PillLink from "@/components/PillLink";

/** Shown in place of the fare when /fares/[id] has an id we don't know. */
export default function FareNotFound() {
  return (
    <div className="flex flex-col items-start gap-5 py-16">
      <Label>Fare not found</Label>
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] leading-none tracking-[-0.03em]">
        This fare is no longer available
      </h1>
      <p className="max-w-md text-soft">
        It may have sold out, or the link may be wrong. Search again to see
        today&rsquo;s fares.
      </p>
      <PillLink href="/search">Search fares</PillLink>
    </div>
  );
}
