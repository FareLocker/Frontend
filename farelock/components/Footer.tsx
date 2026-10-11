import Link from "next/link";
import Container from "./Container";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "FareLock terms", href: "/lock-terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-background text-[0.8rem]">
      <Container className="pt-24 pb-8 max-md:pt-12 max-md:pb-6">
        <div className="grid gap-8 max-md:grid-cols-2 max-md:gap-x-6 max-md:gap-y-10 md:grid-cols-12">
          <div className="flex flex-col gap-4 max-md:col-span-2 max-md:gap-3 md:col-span-6">
            <p className="text-lg tracking-[-0.02em]">FareLocker</p>
            <p className="max-w-[300px] text-muted">
              Buy a FareLock after you book. Cash out if the fare drops.
            </p>
          </div>

          {columns.map((column) => (
            <nav
              key={column.heading}
              aria-label={column.heading}
              className="flex flex-col max-md:min-w-0 md:col-span-3"
            >
              <p className="mb-2 text-[0.7rem] uppercase text-muted max-md:mb-1">
                {column.heading}
              </p>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 transition-opacity hover:opacity-60 max-md:flex max-md:min-h-11 max-md:items-center max-md:py-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-16 max-md:mt-10 flex flex-wrap justify-between gap-x-8 gap-y-2 border-t border-line pt-4 text-[0.7rem] uppercase text-muted">
          <span>© FareLocker</span>
          <span>All rights reserved</span>
        </div>
      </Container>
    </footer>
  );
}
