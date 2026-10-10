import Intro from "@/components/Intro";
import SearchBar from "@/components/SearchForm";
import LoginLink from "@/components/LoginLink";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-6 pb-24">
      <Intro />
      <SearchBar />
      <LoginLink />
    </main>
  );
}
