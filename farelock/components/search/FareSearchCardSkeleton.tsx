import { fareCardClass } from "./FareSearchCard";

const bar = "rounded-full bg-foreground/10";

/**
 * A grey stand-in the same size and shape as a FareSearchCard, shown while
 * results load so the page doesn't jump when they arrive.
 */
export default function FareSearchCardSkeleton() {
  return (
    <div
      aria-hidden
      className={`${fareCardClass} animate-pulse motion-reduce:animate-none`}
    >
      <div className="flex min-w-0 flex-[2_1_520px] flex-col justify-between gap-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={`${bar} h-4 w-44`} />
          <div className="flex gap-2">
            <div className={`${bar} h-8 w-20`} />
            <div className={`${bar} h-8 w-20`} />
          </div>
        </div>
        <div className="flex items-end gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <div className={`${bar} h-3 w-12`} />
            <div className={`${bar} h-9 w-24`} />
            <div className={`${bar} h-3 w-28`} />
          </div>
          <div className="mb-[38px] h-px min-w-10 flex-1 bg-foreground/15" />
          <div className="flex flex-col gap-2">
            <div className={`${bar} h-3 w-12`} />
            <div className={`${bar} h-9 w-24`} />
            <div className={`${bar} h-3 w-28`} />
          </div>
        </div>
      </div>
      <div className="min-h-[150px] min-w-0 flex-[1_1_260px] rounded-[1.25rem] bg-foreground/[0.06]" />
      <div className="flex min-w-0 flex-[1_1_230px] flex-col items-end justify-between gap-4">
        <div className={`${bar} h-11 w-32`} />
        <div className={`${bar} h-3 w-36`} />
        <div className={`${bar} h-12 w-32`} />
      </div>
    </div>
  );
}
