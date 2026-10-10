import Link from "next/link";
import type { ReactNode } from "react";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/**
 * Class names for the two pill sizes, exported so a <button> can look the same
 * as a link (see FocusSearchButton).
 *
 * - "md": the main button. White outline, inverts on hover.
 * - "sm": the quieter inline link. Grey outline, brightens on hover.
 */
export const pillClass = {
  md: `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-foreground px-4 py-2 text-xs uppercase leading-tight transition-colors duration-300 hover:bg-foreground hover:text-background sm:px-5 sm:py-[0.8rem] sm:text-[0.85rem] lg:px-7 ${focusRing}`,
  sm: `inline-flex min-h-11 items-center gap-1.5 rounded-full border border-muted px-4 text-xs uppercase transition-colors duration-300 hover:border-foreground ${focusRing}`,
} as const;

/**
 * The solid white button for a page's one main action ("Lock this fare",
 * "Create account"). It turns the accent colour on hover. Works on a link or
 * a <button>; add "w-full" where it should fill its column.
 */
export const solidButtonClass = `flex min-h-[60px] cursor-pointer items-center justify-center rounded-full bg-foreground px-6 text-center text-[1.05rem] font-semibold tracking-[-0.01em] text-background transition-colors duration-300 hover:bg-accent ${focusRing}`;

export default function PillLink({
  href,
  children,
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  size?: keyof typeof pillClass;
  className?: string;
}) {
  return (
    <Link href={href} className={`${pillClass[size]} ${className}`}>
      {children}
    </Link>
  );
}
