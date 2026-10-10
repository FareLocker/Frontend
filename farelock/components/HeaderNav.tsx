import { getCurrentUser } from "@/lib/auth";
import LoginLink from "./LoginLink";
import PillLink from "./PillLink";
import UserButton from "./UserButton";

const navClass = "flex flex-wrap items-center gap-2 lg:gap-4";

/**
 * The header buttons. Which set shows depends on whether someone is signed in:
 *
 *   signed out: Log in
 *   signed in:  My locks, Add funds, Account
 */
export default async function HeaderNav() {
  const user = await getCurrentUser();

  return (
    <nav aria-label="Main" className={navClass}>
      {user ? (
        <>
          <PillLink href="/locks">My locks</PillLink>
          <PillLink href="/wallet">Add funds</PillLink>
          <UserButton />
        </>
      ) : (
        <LoginLink />
      )}
    </nav>
  );
}

/**
 * Shown for the instant before the session is known. The two states share no
 * button, so it is an empty space the height of one: the header does not
 * jump when the buttons arrive, and a signed-in visitor never sees "Log in"
 * flash up.
 */
export function HeaderNavFallback() {
  return <div aria-hidden className="min-h-11" />;
}
