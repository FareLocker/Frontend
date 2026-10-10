import Link from "next/link";
import Container from "./Container";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Lock terms", href: "/lock-terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line text-[0.8rem]">
      <Container className="pt-24 pb-8">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="flex flex-col gap-4 md:col-span-6">
            <p className="text-lg tracking-[-0.02em]">FareLock</p>
            <p className="max-w-[300px] text-muted">
              Lock today&apos;s fare. Book when you&apos;re ready.
            </p>
          </div>

          {columns.map((column) => (
            <nav
              key={column.heading}
              aria-label={column.heading}
              className="flex flex-col md:col-span-3"
            >
              <p className="mb-2 text-[0.7rem] uppercase text-muted">
                {column.heading}
              </p>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-x-8 gap-y-2 border-t border-line pt-4 text-[0.7rem] uppercase text-muted">
          <span>© FareLock</span>
          <span>All rights reserved</span>
        </div>
      </Container>
    </footer>
  );
}
