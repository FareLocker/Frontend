import { getCurrentUser } from "@/lib/auth";
import HeaderMenu from "./HeaderMenu";
import LoginLink from "./LoginLink";
import PillLink from "./PillLink";
import UserButton from "./UserButton";

const navClass = "flex flex-wrap items-center gap-2 lg:gap-4";

/** The phone menu's rows: the same destinations as the signed-in pills. */
const signedInLinks = [
  { label: "Wallet", href: "/wallet" },
  { label: "Account", href: "/account" },
];

/**
 * The header buttons. Which set shows depends on whether someone is signed in:
 *
 *   signed out: Log in
 *   signed in:  Wallet, Account
 *
 * Signed in, a phone gets one menu button instead of the pills (HeaderMenu);
 * its rows go to the same places, in the same order.
 */
export default async function HeaderNav() {
  const user = await getCurrentUser();

  return (
    <nav aria-label="Main" className={navClass}>
      {user ? (
        <HeaderMenu links={signedInLinks}>
          <PillLink href="/wallet" className="max-md:hidden">Wallet</PillLink>
          <UserButton className="max-md:hidden" />
        </HeaderMenu>
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
