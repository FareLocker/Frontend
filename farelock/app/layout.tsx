import type { Metadata } from "next";
import "./globals.css";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "FareLocker: never overpay for a flight",
  description:
    "Lock today's fare for a small fee. If the price goes up, you still pay the locked price. If it goes down, you pay less.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Background />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
