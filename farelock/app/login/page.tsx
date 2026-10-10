import type { Metadata } from "next";
import Container from "@/components/Container";
import Label from "@/components/Label";
import AuthForm, { AuthField } from "@/components/auth/AuthForm";
import { logIn } from "./actions";

export const metadata: Metadata = {
  title: "Log in | FareLocker",
};

export default function LoginPage() {
  return (
    <main className="flex-1">
      <Container className="flex max-w-[480px] flex-col gap-8 py-20 md:py-28">
        <div className="flex flex-col gap-4">
          <Label className="text-muted">Log in</Label>
          <h1 className="text-[clamp(2rem,5vw,3rem)] leading-none font-light tracking-[-0.04em]">
            Welcome back
          </h1>
        </div>

        <AuthForm
          action={logIn}
          submitLabel="Log in"
          pendingLabel="Logging in…"
          footer={{ text: "New to FareLocker?", linkLabel: "Create an account", href: "/register" }}
        >
          <AuthField
            label="Email or phone"
            name="identifier"
            autoComplete="username"
            required
          />
          <AuthField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </AuthForm>
      </Container>
    </main>
  );
}
