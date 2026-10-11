import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm, { AuthField } from "@/components/auth/AuthForm";
import AuthHeader from "@/components/auth/AuthHeader";
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
        <Container className="flex items-stretch gap-8 py-12 max-md:flex-col max-md:gap-0 max-md:pt-0 max-md:pb-12">
          {/* The globe fills this box: beside the card from md up, a 300px band above it on a phone. */}
          <div className="relative min-w-0 flex-1 max-md:h-[300px] max-md:flex-none">
            <GlobeOrbit />
          </div>
          <div className="flex w-full items-center justify-center max-md:px-3 md:w-auto md:shrink-0 md:basis-[440px] md:justify-end">
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
                    <Link href="/terms" className="text-foreground underline underline-offset-2 max-md:inline-flex max-md:min-h-11 max-md:items-center">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-foreground underline underline-offset-2 max-md:inline-flex max-md:min-h-11 max-md:items-center">
                      Privacy policy
                    </Link>
                    .
                  </p>
                }
              >
                {/* Side by side; each drops to its own row when the card gets narrow. */}
                <div className="flex flex-wrap gap-x-3 gap-y-5 max-md:flex-nowrap">
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
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  maxLength={20}
                  required
                  hint="Required to connect your FareLocker iMessage line."
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
