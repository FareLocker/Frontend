import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";

export const metadata: Metadata = {
  title: "FareLocker: never overpay for a flight",
  description:
    "Lock today's fare for a small fee. If the price goes up, you still pay the locked price. If it goes down, you pay less.",
  icons: {
    icon: "/favicon.ico",
  },
};

/*
 * The frame every page shares: the document itself and the starry background.
 *
 * Headers and footers are NOT here. They come from the layout of the folder a
 * page lives in:
 *
 *   app/(site)/   the full header (logo, search, nav) and the footer
 *   app/(auth)/   log in and sign up: each page brings its own small header
 *
 * The brackets keep those folder names out of the address, so
 * app/(site)/search/page.tsx is still /search. Put a new page in (site)
 * unless it should not have the search bar and nav.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Background />
        {children}
      </body>
    </html>
  );
}
