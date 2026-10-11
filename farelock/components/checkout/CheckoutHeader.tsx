import Link from "next/link";
import Container from "@/components/Container";
import Logo from "@/components/Logo";

const steps = ["Choose fare", "Review and pay", "Lock active"];

/**
 * The header of the lock checkout: the logo and the three steps of buying a
 * lock, with the current one picked out in the accent colour.
 *
 * It is the same height and style as the site header (Header.tsx). On a
 * phone it is the logo and "Step 2 of 3", then three equal bars with their
 * labels; the current bar is the accent colour. That is a second, simpler
 * list shown only below md (the desktop one is hidden there), so only one
 * is ever on the page.
 * `data-own-header` is explained in components/auth/AuthHeader.tsx.
 */
export default function CheckoutHeader({
  current,
}: {
  /** Which step the member is on, counting from 1. */
  current: 1 | 2 | 3;
}) {
  return (
    <header data-own-header className="z-50 border-b border-line bg-background/80 backdrop-blur-md lg:sticky lg:top-0">
      <Container className="flex min-h-[5.5rem] flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5 max-md:min-h-0 max-md:gap-y-3.5 max-md:pt-3.5 max-md:pb-4">
        <Link
          href="/"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground max-md:flex max-md:min-h-11 max-md:items-center"
        >
          <Logo className="h-5 w-auto sm:h-6" />
        </Link>
        <p className="text-xs uppercase tracking-[0.05em] text-soft md:hidden">
          Step {current} of {steps.length}
        </p>
        <ol
          aria-label="Progress"
          className="grid w-full grid-cols-3 gap-2 text-[0.65rem] uppercase tracking-[0.05em] md:hidden"
        >
          {steps.map((step, index) => {
            const number = index + 1;
            const here = number === current;
            return (
              <li
                key={step}
                aria-current={here ? "step" : undefined}
                className={`flex flex-col gap-2 ${
                  here ? "font-bold" : number < current ? "text-soft" : "text-muted"
                }`}
              >
                <span
                  aria-hidden
                  className={`block h-[3px] rounded-sm ${
                    here ? "bg-accent" : number < current ? "bg-muted" : "bg-foreground/20"
                  }`}
                />
                {step}
              </li>
            );
          })}
        </ol>
        <ol
          aria-label="Progress"
          className="flex flex-wrap items-center gap-x-7 gap-y-3 text-xs uppercase tracking-[0.05em] max-md:hidden"
        >
          {steps.map((step, index) => {
            const number = index + 1;
            const here = number === current;
            return (
              <li
                key={step}
                aria-current={here ? "step" : undefined}
                className={`flex items-center gap-2.5 ${
                  here ? "font-bold" : number < current ? "text-soft" : "text-muted"
                }`}
              >
                <span
                  className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs tracking-normal ${
                    here
                      ? "bg-accent text-background"
                      : number < current
                        ? "border border-muted"
                        : "border border-foreground/30"
                  }`}
                >
                  {number}
                </span>
                {step}
              </li>
            );
          })}
        </ol>
      </Container>
    </header>
  );
}
