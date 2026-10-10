import type { ReactNode } from "react";

/** The page's content column: 1400px wide at most, with side gutters. */
export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1400px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
