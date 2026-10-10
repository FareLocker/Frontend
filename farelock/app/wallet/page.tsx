import { redirect } from "next/navigation";
import { Suspense } from "react";
import Container from "@/components/Container";
import Label from "@/components/Label";
import PillLink from "@/components/PillLink";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { getBalance } from "@/lib/wallet";

export default function WalletPage() {
  return (
    <main className="flex-1">
      <Container className="flex flex-col gap-6 py-20 md:py-28">
        <Label>Wallet</Label>
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <Balance />
        </Suspense>
        <div>
          <PillLink href="/wallet/checkout">Add funds</PillLink>
        </div>
      </Container>
    </main>
  );
}

async function Balance() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const balance = await getBalance(user.id);
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.7rem] uppercase text-muted">Current funds</span>
      <p className="text-[clamp(3rem,8vw,6rem)] leading-none">{formatMoney(balance)}</p>
    </div>
  );
}
