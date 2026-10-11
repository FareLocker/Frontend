"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { addFunds } from "@/lib/wallet";

export async function pay(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const amount = String(formData.get("amount"));
  if (!(Number(amount) > 0)) throw new Error("Amount must be more than $0");

  await addFunds(user.id, amount); // the "payment"

  revalidatePath("/wallet"); // make sure the new balance shows
  redirect("/wallet");       // back to the wallet page
}
