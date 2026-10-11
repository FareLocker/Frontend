import { UserIcon } from "./icons";
import PillLink from "./PillLink";

export default function UserButton({ className = "" }: { className?: string }) {
  return (
    <PillLink href="/account" className={className}>
      <UserIcon />
      Account
    </PillLink>
  );
}
