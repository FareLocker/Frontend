import Form from "next/form";

export default function SearchBar() {
  return (
    <input
      type="text"
      placeholder="Search flights, airlines, or airports"
      className="h-14 w-full rounded-full border border-black/15 bg-white px-6 text-black shadow-sm outline-none placeholder:text-zinc-600 focus:border-black"
    />
  );
}
