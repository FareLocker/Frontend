import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Card from "@/components/Card";
import Container from "@/components/Container";
import DetailList, { DetailRow } from "@/components/DetailList";
import Label from "@/components/Label";
import LabelValue from "@/components/LabelValue";
import PillLink, { pillClass } from "@/components/PillLink";
import TicketDemo from "@/components/TicketDemo";
import { logOut } from "@/app/login/actions";
import LockList from "@/components/account/LockList";
import { cardHeadingClass } from "@/components/trade/FlightDetailsCard";
import { activeLocks, getAccount } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { getBalance } from "@/lib/wallet";
import type { Money } from "@/types/fare";

export const metadata: Metadata = {
  title: "Account | FareLocker",
};

/*
 * The member's account: who they are, their balance, and their locks.
 * Who is signed in is only known per request, so everything that depends on
 * it sits inside <Suspense>: the frame appears at once and the rest streams in.
 */
export default function AccountPage() {
  return (
    <main className="flex-1">
      <Container className="flex flex-col gap-5 pt-10 pb-20 md:pt-14">
        <Suspense fallback={<AccountSkeleton />}>
          <AccountView />
        </Suspense>
      </Container>
    </main>
  );
}

async function AccountView() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [account, balance] = await Promise.all([
    getAccount(user),
    readBalance(user.id),
  ]);
  const active = activeLocks(account);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-6 pb-5">
        <div className="min-w-0">
          <Label className="text-muted">Account</Label>
          <h1 className="mt-4 text-[clamp(2.25rem,5vw,3.75rem)] leading-none font-light tracking-[-0.04em]">
            {account.name}
          </h1>
          <p className="mt-3 text-[13px] text-muted">
            {account.tier} · {account.memberNumber} · Member since{" "}
            {account.memberSince}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PillLink href="/wallet/checkout" size="sm">
            Add funds
          </PillLink>
          <PillLink href="/search">Find a fare</PillLink>
          <form action={logOut}>
            <button type="submit" className={`${pillClass.sm} cursor-pointer`}>
              Log out
            </button>
          </form>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card tone="raised" size="md">
          <LabelValue
            label="Wallet balance"
            size="lg"
            detail={
              <span className="text-muted">
                {balance ? "Available to spend" : "Couldn't load your balance"}
              </span>
            }
          >
            {balance ? formatMoney(balance) : "—"}
          </LabelValue>
        </Card>
        <Card tone="raised" size="md">
          <LabelValue
            label="Active locks"
            size="lg"
            detail={
              <span className="text-muted">
                {active.length ? "Protecting fares now" : "None right now"}
              </span>
            }
          >
            {active.length}
          </LabelValue>
        </Card>
        <Card tone="raised" size="md">
          <LabelValue
            label="Total saved"
            size="lg"
            detail={<span className="text-muted">Paid out on settled locks</span>}
          >
            {formatMoney(account.totalSaved)}
          </LabelValue>
        </Card>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className={cardHeadingClass}>Your locks</h2>
              {account.locks.length ? (
                <span className="text-[13px] text-muted">
                  {account.locks.length} total
                </span>
              ) : null}
            </div>
            <LockList locks={account.locks} />
          </Card>

          <section aria-label="Membership card" className="flex flex-col gap-4 pt-5">
            <Label className="text-muted">Membership card</Label>
            <TicketDemo
              ticket={{
                name: account.name,
                memberNumber: account.memberNumber,
                tier: account.tier,
                homeAirport: account.homeAirport,
                memberSince: account.memberSince,
                activeLocks: String(active.length),
                totalSaved: formatMoney(account.totalSaved),
              }}
            />
          </section>
        </div>

        <aside aria-label="Account details" className="flex min-w-0 flex-col gap-5">
          <Card>
            <h2 className={cardHeadingClass}>Account details</h2>
            <DetailList>
              <DetailRow label="Name">{account.name}</DetailRow>
              <DetailRow label="Member no.">{account.memberNumber}</DetailRow>
              <DetailRow label="Membership">{account.tier}</DetailRow>
              <DetailRow label="Home airport">{account.homeAirport}</DetailRow>
              <DetailRow label="Member since">{account.memberSince}</DetailRow>
            </DetailList>
          </Card>
        </aside>
      </div>
    </>
  );
}

/** The balance, or null if the wallet can't be read right now. */
async function readBalance(userId: string): Promise<Money | null> {
  try {
    const balance = await getBalance(userId);
    return Number.isFinite(balance.amount) ? balance : null;
  } catch {
    return null;
  }
}

const block = "bg-foreground/[0.06]";

/** Grey stand-ins in the same layout, so the page doesn't jump on load. */
function AccountSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-5 motion-reduce:animate-none">
      <div className="flex flex-col gap-4 pb-5">
        <div className={`${block} h-3 w-24 rounded-full`} />
        <div className={`${block} h-12 w-72 max-w-full rounded-2xl`} />
        <div className={`${block} h-3 w-60 max-w-full rounded-full`} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div className={`${block} h-[120px] rounded-3xl`} />
        <div className={`${block} h-[120px] rounded-3xl`} />
        <div className={`${block} h-[120px] rounded-3xl`} />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className={`${block} h-64 rounded-[2rem]`} />
        <div className={`${block} h-80 rounded-[2rem]`} />
      </div>
    </div>
  );
}
