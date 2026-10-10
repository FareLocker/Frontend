import FareTradeLayout from "./FareTradeLayout";

const block = "bg-foreground/[0.06]";

/**
 * Grey stand-ins for the trading page while the fare loads, in the same
 * layout, so the page doesn't jump when the fare arrives.
 */
export default function FareTradeSkeleton() {
  return (
    <div aria-hidden className="animate-pulse motion-reduce:animate-none">
      <FareTradeLayout
        main={
          <>
            <div className={`${block} min-h-[580px] rounded-[2rem]`} />
            <div className="flex flex-wrap gap-5 *:flex-[1_1_320px]">
              <div className={`${block} h-80 rounded-[2rem]`} />
              <div className={`${block} h-80 rounded-[2rem]`} />
            </div>
          </>
        }
        aside={
          <>
            <div className={`${block} h-[84px] rounded-3xl`} />
            <div className={`${block} h-[460px] rounded-[2rem]`} />
            <div className="grid grid-cols-2 gap-5">
              <div className={`${block} h-[88px] rounded-3xl`} />
              <div className={`${block} h-[88px] rounded-3xl`} />
            </div>
          </>
        }
      />
    </div>
  );
}
