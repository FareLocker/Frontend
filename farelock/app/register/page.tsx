import type { Metadata } from "next";
import Container from "@/components/Container";
import Label from "@/components/Label";
import AuthForm, { AuthField } from "@/components/auth/AuthForm";
import { register } from "../login/actions";

export const metadata: Metadata = {
  title: "Create account | FareLocker",
};

export default function RegisterPage() {
  return (
    <main className="flex-1">
      <Container className="flex max-w-[480px] flex-col gap-8 py-20 md:py-28">
        <div className="flex flex-col gap-4">
          <Label className="text-muted">Create account</Label>
          <h1 className="text-[clamp(2rem,5vw,3rem)] leading-none font-light tracking-[-0.04em]">
            Lock your first fare
          </h1>
        </div>

        <AuthForm
          action={register}
          submitLabel="Create account"
          pendingLabel="Creating account…"
          footer={{ text: "Already have an account?", linkLabel: "Log in", href: "/login" }}
        >
          <div className="grid grid-cols-2 gap-4">
            <AuthField label="First name" name="first_name" autoComplete="given-name" maxLength={50} required />
            <AuthField label="Last name" name="last_name" autoComplete="family-name" maxLength={50} required />
          </div>
          <AuthField label="Email" name="email" type="email" autoComplete="email" required />
          <AuthField
            label="Phone (optional)"
            name="phone_number"
            type="tel"
            autoComplete="tel"
            maxLength={20}
          />
          <AuthField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
        </AuthForm>
      </Container>
    </main>
  );
}
