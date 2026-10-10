import { logIn } from "@/app/(auth)/actions";
import { solidButtonClass } from "@/components/PillLink";
import TextField from "@/components/TextField";
import GoogleButton from "./GoogleButton";
import PasswordField from "./PasswordField";

/**
 * The log in form: Google, or email and password.
 *
 * It posts to the `logIn` server action, which is empty for now (see
 * app/(auth)/actions.ts), so submitting it does nothing yet.
 */
export default function LogInForm() {
  return (
    <form action={logIn} className="flex flex-col gap-5">
      <GoogleButton />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />
      <PasswordField autoComplete="current-password" />
      <button type="submit" className={`${solidButtonClass} w-full`}>
        Log in
      </button>
    </form>
  );
}
