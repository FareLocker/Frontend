import Link from "next/link";
import { signUp } from "@/app/(auth)/actions";
import { solidButtonClass } from "@/components/PillLink";
import TextField from "@/components/TextField";
import { TBD } from "@/lib/placeholders";
import GoogleButton from "./GoogleButton";
import PasswordField from "./PasswordField";

/**
 * The sign up form: Google, or email, an optional phone number and a
 * password.
 *
 * It posts to the `signUp` server action, which is empty for now (see
 * app/(auth)/actions.ts), so submitting it does nothing yet.
 */
export default function SignUpForm() {
  return (
    <form action={signUp} className="flex flex-col gap-5">
      <GoogleButton />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <TextField
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+1 555 0100"
        optional
        hint={`We use it for ${TBD.phonePurpose}.`}
      />
      <PasswordField
        autoComplete="new-password"
        hint={`At least ${TBD.passwordMinLength} characters.`}
      />
      <button type="submit" className={`${solidButtonClass} w-full`}>
        Create account
      </button>
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
    </form>
  );
}
