import Footer from "@/components/Footer";

/**
 * The lock checkout. Like log in and sign up, it leaves out the site header:
 * the page renders a <CheckoutHeader> that shows the steps instead, so there
 * is no search bar or nav to wander off into halfway through paying.
 */
export default function CheckoutLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
