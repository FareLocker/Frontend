import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm, { AuthField } from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordField from "@/components/auth/PasswordField";
// The team's actions stay in app/login/. That folder has no page.tsx any
// more, so it is not a route and doesn't clash with this /login page.
import { logIn } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Log in | FareLocker",
};

/*
 * /login. The team's page, moved into the (auth) group (no site header, keeps
 * the footer) and re-skinned with update 02's small header and card. The form
 * still posts to the team's logIn action.
 */
export default function LoginPage() {
  return (
    <>
      <AuthHeader prompt="Don't have an account?" href="/register" action="Create account" />
      {/* Tall enough to fill the first screen under the header. */}
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:min-h-[max(40rem,calc(100svh-5.6rem))]">
        <AuthCard title="Welcome back" intro="See your locks and what they are worth.">
          <AuthForm
            action={logIn}
            submitLabel="Log in"
            pendingLabel="Logging in…"
            footer={{ text: "New to FareLocker?", linkLabel: "Create an account", href: "/register" }}
          >
            {/* NEW (update 02): no function yet. See LATER (Google sign-in) in GoogleButton. */}
            <GoogleButton />
            <AuthField
              label="Email or phone"
              name="identifier"
              autoComplete="username"
              required
            />
            {/* NEW (update 02): Show / Hide toggle. Same name="password" the action reads. */}
            <PasswordField autoComplete="current-password" />
          </AuthForm>
        </AuthCard>
      </main>
    </>
  );
}
