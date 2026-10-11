import Link from "next/link";
import LogoIntro from "@/components/LogoIntro";
import { solidButtonClass } from "@/components/PillLink";

/** The one-time confirmation shown after FareLocker has created a lock. */
export default function LockActivation({ fareHref }: { fareHref: string }) {
  return (
    <section
      aria-labelledby="lock-active-heading"
      className="flex min-h-[calc(100svh-5.5rem)] flex-col justify-center gap-7 py-10"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          FareLocker active
        </p>
        <h1 id="lock-active-heading" className="text-4xl tracking-[-0.04em] sm:text-6xl">
          Your fare is locked.
        </h1>
        <p className="max-w-md text-sm leading-normal text-soft">
          We&apos;ll protect this fare until departure.
        </p>
      </div>

      <div
        role="img"
        aria-label="A plane transforms the FareLocker globe into the FareLocker logo"
        className="relative mx-auto flex min-h-[20rem] w-full max-w-6xl items-center overflow-hidden rounded-[2rem] border border-foreground/10 bg-pitch shadow-2xl motion-reduce:hidden"
      >
        <div className="aspect-[732/95] w-full">
          <LogoIntro start="globe" upTo="logo" logoWidth={0.9} />
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-xl rounded-[2rem] border border-foreground/10 bg-pitch px-7 py-14 text-center motion-reduce:block">
        <p className="text-lg font-medium">Your FareLocker protection is active.</p>
      </div>

      <Link href={fareHref} className={`${solidButtonClass} mx-auto w-full max-w-sm`}>
        View your lock
      </Link>
    </section>
  );
}
