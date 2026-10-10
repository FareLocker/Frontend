import { getCurrentUser } from "@/lib/auth";
import LoginLink from "./LoginLink";
import PillLink from "./PillLink";
import UserButton from "./UserButton";

const navClass = "flex flex-wrap items-center gap-2 lg:gap-4";

/**
 * The header buttons. Which set shows depends on whether someone is signed in:
 *
 *   signed out: How it works, Log in
 *   signed in:  My locks, How it works, Add funds, Account
 */
export default async function HeaderNav() {
  const user = await getCurrentUser();

  return (
    <nav aria-label="Main" className={navClass}>
      {user ? (
        <>
          <PillLink href="/locks">My locks</PillLink>
          <PillLink href="/how-it-works">How it works</PillLink>
          <PillLink href="/wallet">Add funds</PillLink>
          <UserButton />
        </>
      ) : (
        <>
          <PillLink href="/how-it-works">How it works</PillLink>
          <LoginLink />
        </>
      )}
    </nav>
  );
}

/**
 * Shown for the instant before the session is known. It holds only the link
 * both states share, so a signed-in visitor never sees "Log in" flash up.
 */
export function HeaderNavFallback() {
  return (
    <nav aria-label="Main" className={navClass}>
      <PillLink href="/how-it-works">How it works</PillLink>
    </nav>
  );
}
