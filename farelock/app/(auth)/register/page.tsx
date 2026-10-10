import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm, { AuthField } from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
import GoogleButton from "@/components/auth/GoogleButton";
import PasswordField from "@/components/auth/PasswordField";
import Container from "@/components/Container";
import GlobeOrbit from "@/components/GlobeOrbit";
import { register } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Create account | FareLocker",
};

/*
 * /register. The team's page, moved into the (auth) group and re-skinned with
 * update 02's small header, card and globe. Update 02 called this page
 * /signup; the team's /register address is kept, and every link points here.
 * Fields, limits and the register action are the team's.
 */
export default function RegisterPage() {
  return (
    <>
      <AuthHeader prompt="Already have an account?" href="/login" action="Log in" />
      {/* Tall enough to fill the first screen under the header. */}
      <main className="flex flex-1 lg:min-h-[max(40rem,calc(100svh-5.6rem))]">
        <Container className="flex items-stretch gap-8 py-12">
          {/* The globe fills this box. Below `md` there is no room, so it's hidden. */}
          <div className="relative hidden min-w-0 flex-1 md:block">
            <GlobeOrbit />
          </div>
          <div className="flex w-full items-center justify-center md:w-auto md:shrink-0 md:basis-[440px] md:justify-end">
            <AuthCard
              title="Lock your first fare"
              intro="An account keeps your locked fares in one place."
            >
              <AuthForm
                action={register}
                submitLabel="Create account"
                pendingLabel="Creating account…"
                footer={{ text: "Already have an account?", linkLabel: "Log in", href: "/login" }}
                note={
                  // NEW (update 02): /terms and /privacy pages don't exist yet.
                  <p className="text-center text-xs leading-normal text-muted">
                    By creating an account you agree to the{" "}
                    <Link href="/terms" className="text-foreground underline underline-offset-2">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-foreground underline underline-offset-2">
                      Privacy policy
                    </Link>
                    .
                  </p>
                }
              >
                {/* NEW (update 02): no function yet. See LATER (Google sign-in) in GoogleButton. */}
                <GoogleButton />
                {/* Side by side; each drops to its own row when the card gets narrow. */}
                <div className="flex flex-wrap gap-x-3 gap-y-5">
                  <div className="min-w-0 flex-1 basis-[150px]">
                    <AuthField label="First name" name="first_name" autoComplete="given-name" maxLength={50} required />
                  </div>
                  <div className="min-w-0 flex-1 basis-[150px]">
                    <AuthField label="Last name" name="last_name" autoComplete="family-name" maxLength={50} required />
                  </div>
                </div>
                <AuthField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
                <AuthField
                  label="Phone"
                  name="phone_number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 0100"
                  maxLength={20}
                  optional
                  hint="You can log in with it instead of your email."
                />
                {/* NEW (update 02): Show / Hide toggle. 8 to 72 is the backend's rule. */}
                <PasswordField
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  hint="8 to 72 characters."
                />
              </AuthForm>
            </AuthCard>
          </div>
        </Container>
      </main>
    </>
  );
}
