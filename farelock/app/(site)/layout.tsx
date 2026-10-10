import Footer from "@/components/Footer";
import Header from "@/components/Header";

/** Every page in this folder gets the full site header and the footer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
