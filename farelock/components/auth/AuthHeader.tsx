import Link from "next/link";
import Container from "@/components/Container";
import Logo from "@/components/Logo";
import PillLink from "@/components/PillLink";

/**
 * The small header on log in and sign up: the logo, and one prompt that
 * leads to the other page.
 *
 *   <AuthHeader prompt="Don't have an account?" href="/register" action="Create account" />
 *
 * It is the same height and style as the site header (Header.tsx), without
 * the search bar and nav.
 *
 * `data-own-header` marks a header that stands in for the site header. It
 * only matters if the site header is still added to every page by
 * app/layout.tsx: a rule at the end of app/globals.css then hides the site
 * header on any page that has one of these. Where pages are sorted into
 * (site) and (auth) folders instead, nothing reads it.
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
    <header data-own-header className="z-50 border-b border-line bg-background/80 backdrop-blur-md lg:sticky lg:top-0">
      <Container className="flex min-h-[5.5rem] flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5 max-md:min-h-0 max-md:flex-nowrap max-md:pt-3.5 max-md:pb-4">
        <Link
          href="/"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground max-md:flex max-md:min-h-11 max-md:items-center"
        >
          <Logo className="h-5 w-auto sm:h-6" />
        </Link>
        <nav aria-label="Account" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {/* Phone: one row. The same question and link sit under the form. */}
          <span className="text-[0.85rem] text-muted max-md:hidden">{prompt}</span>
          <PillLink href={href}>{action}</PillLink>
        </nav>
      </Container>
    </header>
  );
}
