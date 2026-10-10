import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-32 text-black">
      <h1 className="text-5xl font-semibold">FareLock</h1>
      <SearchForm />
    </main>

  );
}
