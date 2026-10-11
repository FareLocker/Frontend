import type { Metadata } from "next";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Label from "@/components/Label";
import PillLink from "@/components/PillLink";

export const metadata: Metadata = {
  title: "Page not found | FareLocker",
};

/*
 * Shown for any address that is not a page.
 *
 * It sits outside the (site) folder, so it does not get that folder's header
 * and footer for free and has to render them itself. Without them a visitor
 * who follows a dead link would land on a page with no way back.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="flex flex-col items-start gap-5 py-24">
          <Label>Page not found</Label>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] leading-none tracking-[-0.03em]">
            There is nothing at this address
          </h1>
          <p className="max-w-md text-soft">
            The link may be wrong, or the page may not have been built yet.
          </p>
          <PillLink href="/">Back to the home page</PillLink>
        </Container>
      </main>
      <Footer />
    </>
  );
}
