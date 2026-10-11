import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Container from "@/components/Container";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import LockActivation from "@/components/checkout/LockActivation";
import { getCurrentUser } from "@/lib/auth";
import { getLockForFare, getLocks } from "@/lib/locks";

export const metadata: Metadata = {
  title: "Your fare is locked | FareLocker",
};

type SearchParams = PageProps<"/checkout/success">["searchParams"];

/**
 * A brief, protected interstitial after a confirmed purchase. It never treats
 * a URL alone as proof of purchase: the signed-in member must hold the fare's
 * currently open lock before the animation is shown.
 */
export default function LockSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <>
      <CheckoutHeader current={3} />
      <main className="flex-1">
        <Container>
          <Suspense fallback={null}>
            <LockSuccess searchParams={searchParams} />
          </Suspense>
        </Container>
      </main>
    </>
  );
}

async function LockSuccess({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { fare: fareParam, lock: lockParam } = await searchParams;
  const fareId = (Array.isArray(fareParam) ? fareParam[0] : fareParam) ?? "";
  const lockId = (Array.isArray(lockParam) ? lockParam[0] : lockParam) ?? "";
  const fareHref = `/fares/${encodeURIComponent(fareId)}`;
  const lock = lockId
    ? (await getLocks()).find((candidate) => candidate.id === lockId)
    : fareId
      ? await getLockForFare(fareId)
      : null;
  if (!lock || lock.status !== "open" || lock.fareId !== fareId) redirect(fareHref);

  return <LockActivation fareHref={fareHref} />;
}
