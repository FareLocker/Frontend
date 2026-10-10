import { cookies } from "next/headers";
import { cache } from "react";
import { api } from "@/lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
};

/**
 * The httpOnly cookie holding the backend's access token. Only the Next
 * server reads it; browser JavaScript can't.
 */
export const TOKEN_COOKIE = "farelock_token";

/** Matches access_token_expire_minutes on the backend (7 days). */
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** The signed-in user's token, for `Authorization: Bearer …`, or null. */
export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

/** Headers for a backend call made as the signed-in user. */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type BackendUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  balance_cents: number;
};

/**
 * Who is signed in, or null. Asks the backend's /auth/me, so an expired or
 * forged token counts as signed out.
 *
 * Reading the cookie is a request-time read, which this project's Cache
 * Components setup only allows behind a <Suspense> boundary; every caller
 * already is. React's cache() means the header and the page share one
 * lookup per request. See
 * node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const headers = await authHeaders();
  if (!headers.Authorization) return null;
  try {
    const me = await api<BackendUser>("/auth/me", { headers });
    return {
      id: String(me.id),
      name: `${me.first_name} ${me.last_name}`.trim(),
      email: me.email,
    };
  } catch {
    return null;
  }
});
