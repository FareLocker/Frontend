import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import AuthHeader from "@/components/auth/AuthHeader";
import Container from "@/components/Container";
import GlobeOrbit from "@/components/GlobeOrbit";
import PillLink, { pillClass } from "@/components/PillLink";
import { getCurrentUser } from "@/lib/auth";
import { retryMessaging } from "./actions";

export const metadata: Metadata = { title: "Connect iMessage | FareLocker" };

export default async function ConnectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { status, assignedPhoneNumber } = user.messaging;
  if (status === "connected") redirect("/account");
  const textLink = assignedPhoneNumber
    ? `sms:${assignedPhoneNumber}?body=${encodeURIComponent("START")}`
    : null;

  return (
    <>
      <AuthHeader prompt="Want to do this later?" href="/account" action="Go to account" />
      <main className="flex flex-1 lg:min-h-[max(40rem,calc(100svh-5.6rem))]">
        <Container className="flex items-stretch gap-8 py-12">
          <div className="relative hidden min-w-0 flex-1 md:block"><GlobeOrbit /></div>
          <div className="flex w-full items-center justify-center md:w-auto md:shrink-0 md:basis-[440px] md:justify-end">
            <AuthCard title="Connect your iMessage" intro="Text START once so FareLocker can reply on your shared Spectrum line.">
              {textLink ? (
                <div className="flex flex-col gap-5">
                  <div className="rounded-2xl border border-foreground/15 bg-foreground/5 px-5 py-4 text-center">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Your FareLocker number</p>
                    <p className="mt-2 font-mono text-lg tracking-wide">{assignedPhoneNumber}</p>
                  </div>
                  <a className={`${pillClass.md} w-full`} href={textLink}>Text START</a>
                  <p className="text-center text-xs leading-relaxed text-muted">Send START from the phone number you used to sign up. We’ll welcome you there. ✈️</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <p className="text-sm leading-relaxed text-muted">We couldn’t set up your messaging number yet. Your FareLocker account is ready; try connecting again in a moment.</p>
                  <form action={retryMessaging}><button className={`${pillClass.md} w-full`} type="submit">Retry connection</button></form>
                  <PillLink href="/account" size="md">Continue to account</PillLink>
                </div>
              )}
            </AuthCard>
          </div>
        </Container>
      </main>
    </>
  );
}
