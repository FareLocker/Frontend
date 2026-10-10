import Link from "next/link";
import { isActive } from "@/lib/locks";
import type { Lock } from "@/types/lock";

/** The ways My locks can be narrowed down. "all" is no filter. */
export const lockFilters = ["all", "active", "exercised", "expired"] as const;
export type LockFilterName = (typeof lockFilters)[number];

const filterLabel: Record<LockFilterName, string> = {
  all: "All",
  active: "Active",
  exercised: "Exercised",
  expired: "Expired",
};

/** Which locks each filter keeps. A lock that is settling counts as active. */
export function matchesFilter(lock: Lock, filter: LockFilterName): boolean {
  switch (filter) {
    case "all":
      return true;
    case "active":
      return isActive(lock);
    case "exercised":
      return lock.status === "exercised";
    case "expired":
      return lock.status === "expired";
  }
}

/** Reads ?show=… from the address. Anything unknown means "all". */
export function parseLockFilter(value: string | string[] | undefined): LockFilterName {
  const name = Array.isArray(value) ? value[0] : value;
  return lockFilters.find((filter) => filter === name) ?? "all";
}

const pill =
  "inline-flex min-h-11 items-center rounded-full border px-[18px] text-[13px] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/**
 * The row of pills that narrows the list: All, Active, Exercised, Expired,
 * each with how many locks it holds.
 *
 * They are links, not buttons: the choice lives in the address
 * (/locks?show=active), so it survives a reload and can be shared, and the
 * list is filtered on the server.
 */
export default function LockFilter({
  locks,
  current,
}: {
  locks: Lock[];
  current: LockFilterName;
}) {
  return (
    <nav aria-label="Filter locks" className="flex flex-wrap gap-2 pt-2">
      {lockFilters.map((filter) => {
        const selected = filter === current;
        const count = locks.filter((lock) => matchesFilter(lock, filter)).length;
        return (
          <Link
            key={filter}
            href={filter === "all" ? "/locks" : `/locks?show=${filter}`}
            aria-current={selected ? "page" : undefined}
            // Keep the reader's place: the list is just below.
            scroll={false}
            className={`${pill} ${
              selected
                ? "border-foreground bg-foreground font-semibold text-background"
                : "border-foreground/30 bg-background font-medium hover:border-foreground"
            }`}
          >
            {filterLabel[filter]} ({count})
          </Link>
        );
      })}
    </nav>
  );
}
