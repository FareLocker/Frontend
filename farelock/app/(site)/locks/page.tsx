import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Container from "@/components/Container";
import Label from "@/components/Label";
import LockFilter, {
  matchesFilter,
  parseLockFilter,
} from "@/components/locks/LockFilter";
import LockRow from "@/components/locks/LockRow";
import LockSummary from "@/components/locks/LockSummary";
import PillLink from "@/components/PillLink";
import { getCurrentUser } from "@/lib/auth";
import { getLocks } from "@/lib/locks";

export const metadata: Metadata = {
  title: "My FareLocks | FareLocker",
};

type SearchParams = PageProps<"/locks">["searchParams"];

/*
 * Every lock the member has bought: the ones still running first, then the
 * ones that have ended.
 *
 * Who is signed in, and which filter is picked (/locks?show=active), are
 * only known per request, so everything that depends on them sits inside
 * <Suspense>: the heading appears at once and the rest streams in.
 */
export default function LocksPage({ searchParams }: PageProps<"/locks">) {
  return (
    <main className="flex-1">
      <Container className="flex flex-col gap-6 pt-12 pb-20">
        <header className="flex flex-col gap-3">
          <Label>Your account</Label>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] leading-none tracking-[-0.03em]">
            My FareLocks
          </h1>
        </header>
        <Suspense fallback={<LocksSkeleton />}>
          <LocksView searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}

async function LocksView({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { show } = await searchParams;
  let locks: Awaited<ReturnType<typeof getLocks>>;
  try {
    locks = await getLocks();
  } catch (error) {
    console.error("Lock list failed:", error);
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-4 border-t border-foreground/10 pt-6"
      >
        <p className="max-w-[46ch] text-soft">
          We couldn&rsquo;t load your FareLocks right now. Your purchases are
          safe; try this page again in a moment.
        </p>
        <PillLink href="/locks" size="sm">
          Try again
        </PillLink>
      </div>
    );
  }
  const filter = parseLockFilter(show);
  const shown = locks.filter((lock) => matchesFilter(lock, filter));

  // Reading the clock makes this part render per request, never at build.
  await connection();
  const now = new Date();

  if (locks.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 border-t border-foreground/10 pt-6">
        <p className="max-w-[46ch] text-soft">
          You haven&rsquo;t locked a fare yet. Locks you buy appear here with
          the fare they are on and what they are worth.
        </p>
        <PillLink href="/search" size="sm">
          Find a fare to lock
        </PillLink>
      </div>
    );
  }

  return (
    <>
      <LockSummary locks={locks} now={now} />
      <LockFilter locks={locks} current={filter} />
      {shown.length ? (
        <ul className="flex flex-col gap-5">
          {shown.map((lock) => (
            <LockRow key={lock.id} lock={lock} now={now} />
          ))}
        </ul>
      ) : (
        <p className="border-t border-foreground/10 pt-6 text-soft">
          None of your locks are in this group.
        </p>
      )}
    </>
  );
}

const block = "bg-foreground/[0.06]";

/** Grey stand-ins in the same layout, so the page doesn't jump on load. */
function LocksSkeleton() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none"
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <div className={`${block} h-[120px] rounded-3xl`} />
        <div className={`${block} h-[120px] rounded-3xl`} />
        <div className={`${block} h-[120px] rounded-3xl`} />
      </div>
      <div className={`${block} h-11 w-80 max-w-full rounded-full`} />
      <div className={`${block} h-[150px] rounded-[2rem]`} />
      <div className={`${block} h-[150px] rounded-[2rem]`} />
    </div>
  );
}
