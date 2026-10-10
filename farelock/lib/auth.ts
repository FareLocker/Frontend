export type User = {
  id: string;
  name: string;
};

/**
 * Who is signed in, or null.
 *
 * PLACEHOLDER: there is no backend yet, so nobody is ever signed in. To see
 * the signed-in header while designing, put FARELOCK_DEMO_USER=1 in
 * .env.local and restart the dev server. For a production build, the flag has
 * to be set for both `next build` and `next start`: the header is built into
 * the page ahead of time, so a flag set only at start makes the two disagree
 * and React reports a hydration error.
 *
 * When the backend exists, read the session cookie here. That makes this a
 * request-time read, which this project's Cache Components setup only allows
 * behind a <Suspense> boundary. Header.tsx already wraps the one caller in
 * one, so nothing else has to change. See
 * node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md
 */
export async function getCurrentUser(): Promise<User | null> {
  if (process.env.FARELOCK_DEMO_USER === "1") {
    return { id: "demo", name: "Demo traveller" };
  }
  return null;
}
