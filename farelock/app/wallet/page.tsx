import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Card from "@/components/Card";
import Container from "@/components/Container";
import Label from "@/components/Label";
import PillLink from "@/components/PillLink";
import { cardHeadingClass } from "@/components/trade/FlightDetailsCard";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { getBalanceOrNull } from "@/lib/wallet";

export const metadata: Metadata = {
  title: "Wallet | FareLocker",
};

/** One-tap recharge amounts, in dollars. Each opens checkout pre-filled. */
const RECHARGE_AMOUNTS = [25, 50, 100, 250];

export default function WalletPage() {
  return (
    <main className="flex-1">
      <Container className="flex flex-col gap-5 pt-10 pb-20 md:pt-14">
        <Suspense fallback={<BalanceSkeleton />}>
          <Balance />
        </Suspense>

        <Card>
          <h2 className={cardHeadingClass}>Recharge</h2>
          <div className="grid grid-cols-2 gap-3 border-t border-foreground/10 pt-5 sm:grid-cols-4">
            {RECHARGE_AMOUNTS.map((dollars) => (
              <Link
                key={dollars}
                href={`/wallet/checkout?amount=${dollars}`}
                className="group flex flex-col gap-3 rounded-3xl bg-raised px-[22px] py-5 transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <span className="text-[11px] uppercase tracking-[0.1em] text-muted transition-colors duration-300 group-hover:text-background/60">
                  Add
                </span>
                <span className="text-[2rem] leading-none font-light tracking-[-0.04em] tabular-nums">
                  {formatMoney({ amount: dollars * 100, currency: "USD" })}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[13px] text-muted">
              Demo checkout. No card is charged.
            </p>
            <PillLink href="/wallet/checkout" size="sm">
              Other amount
            </PillLink>
          </div>
        </Card>
      </Container>
    </main>
  );
}

async function Balance() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const balance = await getBalanceOrNull(user.id);
  return (
    <header className="flex flex-col gap-4 pb-5">
      <Label className="text-muted">Wallet</Label>
      <p className="text-[clamp(3rem,8vw,6rem)] leading-none font-extralight tracking-[-0.05em] tabular-nums">
        {balance ? formatMoney(balance) : "—"}
      </p>
      <p className="text-[13px] text-muted">
        {balance ? "Available balance" : "Couldn't load your balance"}
      </p>
    </header>
  );
}

function BalanceSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-4 pb-5 motion-reduce:animate-none">
      <div className="h-3 w-20 rounded-full bg-foreground/[0.06]" />
      <div className="h-[clamp(3rem,8vw,6rem)] w-64 max-w-full rounded-2xl bg-foreground/[0.06]" />
      <div className="h-3 w-32 rounded-full bg-foreground/[0.06]" />
    </div>
  );
}
