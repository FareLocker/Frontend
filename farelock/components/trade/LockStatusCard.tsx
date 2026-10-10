import Card from "@/components/Card";
import { LockIcon } from "@/components/icons";
import QuoteTimer from "./QuoteTimer";

/** The small card above the ticket: can this fare be locked right now? */
export default function LockStatusCard({ available }: { available: boolean }) {
  return (
    <Card
      tone="raised"
      size="md"
      label="Lock status"
      className="flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <p className="text-[1.1rem] font-semibold tracking-[-0.02em]">
          {available ? "Lock available" : "Lock not available"}
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {available ? <QuoteTimer /> : "You can still book this fare today"}
        </p>
      </div>
      <LockIcon className={`h-11 w-11 shrink-0 ${available ? "" : "opacity-40"}`} />
    </Card>
  );
}
