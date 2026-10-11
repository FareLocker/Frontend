"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";

/**
 * The signed-in header links, with a menu button for phones.
 *
 * From `md` up the pills sit in the header row exactly as before. Below `md`
 * they are hidden and one round button opens a panel under the header with
 * the same links as full-width rows. HeaderNav (a server component) still
 * decides signed in or out; this only owns whether the panel is open.
 *
 * The panel closes on Escape, when a link in it is followed, and whenever
 * the route changes.
 */
export default function HeaderMenu({
  links,
  children,
}: {
  /** The menu rows, in the same order and to the same places as the pills. */
  links: { label: string; href: string }[];
  /** The desktop pills, rendered unchanged. */
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();

  // A followed link or the back button changes the route: close the panel.
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((was) => !was)}
        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-foreground transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden"
      >
        <svg aria-hidden viewBox="0 0 18 14" className="h-3.5 w-[18px]" fill="none">
          {open ? (
            <path d="M3 1 L15 13 M15 1 L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M1 1 H17 M1 7 H17 M1 13 H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {children}

      {/* Below the header, full width; hidden from md up. */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-50 border-y border-line bg-background px-5 pb-2 md:hidden"
      >
        {links.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex min-h-14 items-center text-[0.9rem] uppercase transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground ${
              i < links.length - 1 ? "border-b border-foreground/12" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
