import Link from "next/link";

export default function LoginLink() {
  return (
    <Link href="/login" className="text-sm text-black underline underline-offset-4">
      Log in
    </Link>
  );
}
