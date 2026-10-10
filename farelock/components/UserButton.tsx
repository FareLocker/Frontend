import Link from "next/link";

export default function UserButton() {
  return (
    <Link
      href="/account"
      aria-label="Account"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-black"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    </Link>
  );
}
