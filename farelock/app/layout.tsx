import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";
import { SearchNavigationProvider } from "@/components/search/SearchNavigation";

const siteName = "FareLocker";
const title = "FareLocker: never overpay for a flight";
const description =
  "Lock today's fare for a small fee. If the price goes up, you still pay the locked price. If it goes down, you pay less.";

/**
 * Host for absolute og/twitter URLs. Baked in at `next build`.
 * Docker often sets NEXT_PUBLIC_SITE_URL to "" when the build arg is unset —
 * `??` does not treat that as missing, so we treat blank as missing too.
 */
function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = "https://farelocker.nyc";
  try {
    return new URL(raw || fallback);
  } catch {
    return new URL(fallback);
  }
}

const shareImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: siteName,
  type: "image/png",
} as const;

export const metadata: Metadata = {
  metadataBase: siteUrl(),
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
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
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
        {/*
         * Above every route group so Header/SearchForm work on pages that
         * sit outside (site)/ — notably app/not-found.tsx.
         */}
        <SearchNavigationProvider>{children}</SearchNavigationProvider>
      </body>
    </html>
  );
}
