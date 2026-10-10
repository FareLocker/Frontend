import FocusSearchButton from "@/components/FocusSearchButton";
import { CirclePlusIcon } from "@/components/icons";
import Label from "@/components/Label";
import PillLink from "@/components/PillLink";

/*
 * An illustrative fare path, not real data: the fare climbs away from the
 * price it was locked at. Replace FARE_PATH with a real series once fare
 * history is stored. Coordinates are in a 1000 x 400 box, y down.
 */
const LOCKED_Y = 260;
const FARE_PATH =
  "M0 260 L60 248 L120 270 L180 232 L240 240 L300 205 L360 222 L420 180 " +
  "L480 196 L540 160 L600 172 L660 140 L720 150 L780 118 L840 128 L900 100 L1000 84";

/** Full-bleed black panel: the worked example drawn as a chart. */
export default function FareChart() {
  return (
    <section className="relative flex h-[80svh] max-h-[720px] min-h-[480px] items-center justify-center overflow-hidden border-y border-line bg-pitch">
      <svg
        role="img"
        aria-label="Illustration: a fare rising over time above the flat price it was locked at"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d={`M0 ${LOCKED_Y} H1000`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeDasharray="8 8"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={FARE_PATH}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <FocusSearchButton className="relative flex h-[200px] w-[200px] cursor-pointer items-center justify-center rounded-full border border-foreground/80 bg-pitch/35 text-center text-[0.8rem] uppercase backdrop-blur-[4px] transition duration-300 hover:scale-110 hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground">
        Try it on
        <br />
        your route
      </FocusSearchButton>

      <ul className="absolute top-8 left-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.7rem] uppercase tracking-[0.05em] sm:left-8">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-6 bg-foreground" />
          Fare after you lock
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="w-6 border-t-2 border-dashed border-muted" />
          Your locked fare
        </li>
      </ul>

      <Label className="absolute bottom-8 left-5 sm:left-8">Illustration</Label>

      <PillLink
        href="/how-it-works"
        size="sm"
        className="absolute right-5 bottom-5 bg-pitch/60 sm:right-8"
      >
        How the payout works
        <CirclePlusIcon />
      </PillLink>
    </section>
  );
}
