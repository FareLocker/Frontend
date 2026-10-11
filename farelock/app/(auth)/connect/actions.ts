"use server";

import { redirect } from "next/navigation";
import { authHeaders } from "@/lib/auth";
import { api } from "@/lib/api";

export async function retryMessaging() {
  await api("/auth/messaging/retry", {
    method: "POST",
    headers: await authHeaders(),
  });
  redirect("/connect");
}
