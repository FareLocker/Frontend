import { redirect } from "next/navigation";

/** FareLocks live on the wallet page now. */
export default function LocksPage() {
  redirect("/wallet");
}
