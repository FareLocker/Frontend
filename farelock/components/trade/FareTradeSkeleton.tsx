import FareTradeLayout from "./FareTradeLayout";

const block = "bg-foreground/[0.06]";

/**
 * Grey stand-ins for the trading page while the fare loads, in the same
 * layout, so the page doesn't jump when the fare arrives.
 */
export default function FareTradeSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-5 motion-reduce:animate-none">
      {/* The "Back to…" pill, which waits for the fare like everything else. */}
      <div className={`${block} h-11 w-32 rounded-full`} />
      <FareTradeLayout
        main={
          <>
            <div className={`${block} min-h-[580px] rounded-[2rem] max-md:order-1 max-md:min-h-[600px] max-md:rounded-3xl`} />
            <div className="flex flex-wrap gap-5 *:flex-[1_1_320px] max-md:contents">
              <div className={`${block} h-80 rounded-[2rem] max-md:order-5 max-md:rounded-3xl`} />
              <div className={`${block} h-80 rounded-[2rem] max-md:order-6 max-md:rounded-3xl`} />
            </div>
          </>
        }
        aside={
          <>
            <div className={`${block} h-[84px] rounded-3xl max-md:order-2`} />
            <div className={`${block} h-[460px] rounded-[2rem] max-md:order-2 max-md:rounded-3xl`} />
            <div className="grid grid-cols-2 gap-5 max-md:order-3 max-md:gap-3.5">
              <div className={`${block} h-[88px] rounded-3xl`} />
              <div className={`${block} h-[88px] rounded-3xl`} />
            </div>
          </>
        }
      />
    </div>
  );
}
