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

type TokenResponse = { access_token: string };

/**
 * Calls an /auth endpoint. Returns the token, or a sentence for the form.
 * Only the request is guarded here: anything that fails after it (like
 * saving the cookie) throws as itself, so its real cause shows in the logs.
 */
async function requestToken(
  path: "/auth/login" | "/auth/register",
  body: Record<string, unknown>,
  fallback: string,
): Promise<{ token: string } | { error: string }> {
  try {
    const { access_token } = await api<TokenResponse>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!access_token) throw new Error(`${path} answered without an access_token`);
    return { token: access_token };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error(`${path} request failed:`, error);
      return { error: "Can't reach FareLocker right now. Try again in a moment." };
    }
    if (path === "/auth/login" && error.status === 401) {
      return { error: "That email, phone number or password isn't right." };
    }
    if (typeof error.detail === "string") return { error: error.detail };
    if (error.status === 422) {
      return {
        error: "Check your details: a valid email, and a password of 8 to 72 characters.",
      };
    }
    console.error(`${path} failed:`, error.status, error.detail);
    return { error: fallback };
  }
}

export async function logIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = await requestToken(
    "/auth/login",
    {
      identifier: field(formData, "identifier"),
      password: String(formData.get("password") ?? ""),
    },
    "Couldn't log you in. Try again.",
  );
  if ("error" in result) return result;

  await startSession(result.token);
  redirect("/account");
}

export async function register(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = await requestToken(
    "/auth/register",
    {
      first_name: field(formData, "first_name"),
      last_name: field(formData, "last_name"),
      email: field(formData, "email"),
      phone_number: field(formData, "phone_number") || null,
      password: String(formData.get("password") ?? ""),
    },
    "Couldn't create your account. Try again.",
  );
  if ("error" in result) return result;

  await startSession(result.token);
  redirect("/account");
}

export async function logOut() {
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/");
}
