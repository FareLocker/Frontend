import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";

const siteName = "FareLocker";
const title = "FareLocker: never overpay for a flight";
const description =
  "Lock today's fare for a small fee. If the price goes up, you still pay the locked price. If it goes down, you pay less.";

export const metadata: Metadata = {
  // Absolute URLs for og/twitter images. Override with NEXT_PUBLIC_SITE_URL in prod.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName,
    title,
    description,
    locale: "en_US",
    // Image: app/opengraph-image.png (1200×630, logo on site background).
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    // Image: app/twitter-image.png (same asset as the Open Graph card).
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
