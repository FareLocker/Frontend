import { UserIcon } from "./icons";
import PillLink from "./PillLink";

export default function UserButton() {
  return (
    <PillLink href="/account">
      <UserIcon />
      Account
    </PillLink>
  );
}
