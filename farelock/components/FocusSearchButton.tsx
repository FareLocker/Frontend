"use client";

import type { ReactNode } from "react";
import { SEARCH_INPUT_ID } from "@/lib/search";
import { pillClass } from "./PillLink";

/**
 * A button that puts the cursor in the header search bar.
 *
 * The header is sticky, so the bar is always on screen; "search" calls to
 * action lower down the page send people to it instead of to a second form.
 */
export default function FocusSearchButton({
  children,
  className,
}: {
  children: ReactNode;
  /** Replaces the default pill styling when given. */
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => document.getElementById(SEARCH_INPUT_ID)?.focus()}
      className={className ?? `${pillClass.md} cursor-pointer`}
    >
      {children}
    </button>
  );
}
