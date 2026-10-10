"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { TOKEN_COOKIE, TOKEN_MAX_AGE_SECONDS } from "@/lib/auth";

/** What a login or register form shows after a failed submit. */
export type AuthFormState = { error: string } | null;

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

async function startSession(accessToken: string) {
  (await cookies()).set(TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });
}

/** Turns a backend error into a sentence for the form. */
function messageFor(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return "Can't reach FareLocker right now. Try again in a moment.";
  }
  if (typeof error.detail === "string") return error.detail;
  if (error.status === 422) {
    return "Check your details: a valid email, and a password of 8 to 72 characters.";
  }
  return fallback;
}

export async function logIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const { access_token } = await api<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: field(formData, "identifier"),
        password: String(formData.get("password") ?? ""),
      }),
    });
    await startSession(access_token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: "That email, phone number or password isn't right." };
    }
    return { error: messageFor(error, "Couldn't log you in. Try again.") };
  }
  redirect("/account");
}

export async function register(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const { access_token } = await api<{ access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: field(formData, "first_name"),
        last_name: field(formData, "last_name"),
        email: field(formData, "email"),
        phone_number: field(formData, "phone_number") || null,
        password: String(formData.get("password") ?? ""),
      }),
    });
    await startSession(access_token);
  } catch (error) {
    return { error: messageFor(error, "Couldn't create your account. Try again.") };
  }
  redirect("/account");
}

export async function logOut() {
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/");
}
