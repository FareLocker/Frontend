import Link from "next/link";
import Container from "@/components/Container";
import Logo from "@/components/Logo";
import PillLink from "@/components/PillLink";

/**
 * The small header on log in and sign up: the logo, and one prompt that
 * leads to the other page.
 *
 *   <AuthHeader prompt="Don't have an account?" href="/signup" action="Create account" />
 *
 * It is the same height and style as the site header (Header.tsx), without
 * the search bar and nav.
 */
export default function AuthHeader({
  prompt,
  href,
  action,
}: {
  /** The question, e.g. "Don't have an account?" */
  prompt: string;
  href: string;
  /** The button's words, e.g. "Create account". */
  action: string;
}) {
  return (
    <header className="z-50 border-b border-line bg-background/80 backdrop-blur-md lg:sticky lg:top-0">
      <Container className="flex min-h-[5.5rem] flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5">
        <Link
          href="/"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <Logo className="h-5 w-auto sm:h-6" />
        </Link>
        <nav aria-label="Account" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="text-[0.85rem] text-muted">{prompt}</span>
          <PillLink href={href}>{action}</PillLink>
        </nav>
      </Container>
    </header>
  );
}
