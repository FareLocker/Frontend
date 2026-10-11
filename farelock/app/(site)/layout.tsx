import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { SearchNavigationProvider } from "@/components/search/SearchNavigation";

/** Every page in this folder gets the full site header and the footer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <SearchNavigationProvider>
      <Header />
      {children}
      <Footer />
    </SearchNavigationProvider>
  );
}
