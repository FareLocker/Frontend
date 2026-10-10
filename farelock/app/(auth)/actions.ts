"use server";

/*
 * What happens when the log in and sign up forms are submitted.
 *
 * PLACEHOLDER: there is no backend yet, so both of these read the form and
 * then do nothing. The page simply shows the empty form again. The forms
 * already post here (see components/auth/LogInForm.tsx and SignUpForm.tsx),
 * so filling in the two marked sections is all it takes to make them work.
 *
 * They are server actions, the same pattern as `pay` in the wallet's
 * actions.ts. They run on the server, so a password never
 * has to be handled by code in the browser.
 *
 * LATER (errors): to show "wrong password" or "email already used" on the
 * form, return the message from the action and read it in the form with
 * React's useActionState. TextField and PasswordField already take an
 * `error` to display. See
 * node_modules/next/dist/docs/01-app/02-guides/forms.md
 */

export async function logIn(formData: FormData): Promise<void> {
  const credentials = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  // BACKEND (log in) ------------------------------------------------------
  // 1. Send `credentials` to the backend.
  // 2. If it accepts them, store the session it returns in a cookie.
  //    lib/auth.ts getCurrentUser() is where that cookie gets read.
  // 3. redirect() to where the visitor was going, or to "/". If that place
  //    comes from the URL (?next=...), only accept a path on this site that
  //    starts with a single "/", or the link can send people anywhere.
  // On failure, give one message for both "no such account" and "wrong
  // password", so the form cannot be used to find out who has an account.
  // -----------------------------------------------------------------------
  void credentials;
}

export async function signUp(formData: FormData): Promise<void> {
  const account = {
    email: String(formData.get("email") ?? ""),
    // Optional on the form: an empty string means none was given.
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  // BACKEND (sign up) -----------------------------------------------------
  // 1. Check the values: a real email, the password long enough (the rule
  //    shown on the form is TBD.passwordMinLength in lib/placeholders.ts).
  // 2. Send `account` to the backend to create the user.
  // 3. Sign them in as for log in, then redirect().
  // -----------------------------------------------------------------------
  void account;
}
