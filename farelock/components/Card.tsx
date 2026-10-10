import type { ReactNode } from "react";

const toneClass = {
  /** The standard panel. */
  card: "border border-foreground/10 bg-card",
  /** Black, for a panel that holds a chart. */
  pitch: "border border-foreground/10 bg-pitch",
  /** A shade lighter and borderless, for a small card that should stand out. */
  raised: "bg-raised",
} as const;

const sizeClass = {
  lg: "rounded-[2rem] p-7 sm:px-8",
  md: "rounded-3xl px-[22px] py-5",
} as const;

/**
 * The rounded "bubble" panel used across the app.
 * Layout inside it (flex, gaps) is up to the caller, via `className`.
 */
export default function Card({
  children,
  tone = "card",
  size = "lg",
  label,
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof toneClass;
  size?: keyof typeof sizeClass;
  /** Names the panel for screen readers when it has no visible heading. */
  label?: string;
  className?: string;
}) {
  return (
    <section
      aria-label={label}
      className={`min-w-0 ${toneClass[tone]} ${sizeClass[size]} ${className}`}
    >
      {children}
    </section>
  );
}
