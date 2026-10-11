import Container from "@/components/Container";
import Label from "@/components/Label";
import { pillClass } from "@/components/PillLink";
import { pay } from "../actions";

const input =
  "h-12 w-full rounded-lg border border-line bg-transparent px-4 outline-none placeholder:text-faint focus:border-foreground";

export default function CheckoutPage() {
  return (
    <main className="flex-1">
      <Container className="flex max-w-[480px] flex-col gap-8 py-20 md:py-28">
        <Label>Add funds</Label>

        <form action={pay} className="flex flex-col gap-4">
          <input name="amount" type="number" min="1" step="0.01" defaultValue="50" required className={input} />

          {/* Fake card: never read, never sent */}
          <input placeholder="Name on card" required className={input} />
          <input placeholder="4242 4242 4242 4242" required className={input} />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="MM / YY" required className={input} />
            <input placeholder="CVC" required className={input} />
          </div>

          <button type="submit" className={`${pillClass.md} cursor-pointer`}>Pay</button>
          <p className="text-xs text-muted">Demo checkout. No card is charged.</p>
        </form>
      </Container>
    </main>
  );
}
