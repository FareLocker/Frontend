import Footer from "@/components/Footer";

/**
 * Log in and sign up. These pages leave out the site header, so there is no
 * search bar or nav to wander off into; each one renders an <AuthHeader>
 * with its own prompt instead. The footer is the same as everywhere else.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
