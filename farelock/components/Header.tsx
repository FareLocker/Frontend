import Link from "next/link";
import { Suspense } from "react";
import Container from "./Container";
import HeaderNav, { HeaderNavFallback } from "./HeaderNav";
import Logo from "./Logo";
import SearchBar from "./SearchForm";

/*
 * Pinned to the top on desktop, where it fits on one row. On smaller screens
 * it wraps to two or three rows, so it scrolls away instead of covering the page.
 */
export default function Header() {
  return (
    <header className="z-50 border-b border-line bg-background/80 backdrop-blur-md lg:sticky lg:top-0">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5">
        <Link
          href="/"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <Logo className="h-5 w-auto sm:h-6" />
        </Link>

        {/* Between the logo and the buttons on desktop; its own row on a phone. */}
        <SearchBar className="order-last w-full md:order-none md:w-auto md:max-w-[560px] md:flex-1" />

        <Suspense fallback={<HeaderNavFallback />}>
          <HeaderNav />
        </Suspense>
      </Container>
    </header>
  );
}
