"use client";

import { useId, useState, type ReactNode } from "react";
import { describedBy, fieldInputClass, FieldShell } from "@/components/TextField";

/**
 * A password box with a Show / Hide button inside it, so a visitor can check
 * what they typed. That is why sign-up has no "confirm password" box.
 *
 * `autoComplete` should be "new-password" on sign-up and "current-password"
 * on log in, so password managers offer the right thing.
 */
export default function PasswordField({
  label = "Password",
  name = "password",
  autoComplete,
  hint,
  error,
}: {
  label?: string;
  name?: string;
  autoComplete: "new-password" | "current-password";
  hint?: ReactNode;
  error?: string;
}) {
  const id = useId();
  const [shown, setShown] = useState(false);

  return (
    <FieldShell controlId={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          required
          aria-describedby={describedBy(id, hint, error)}
          aria-invalid={error ? true : undefined}
          className={`${fieldInputClass} pr-[84px]`}
        />
        <button
          type="button"
          aria-controls={id}
          onClick={() => setShown((was) => !was)}
          className="absolute top-1 right-1.5 h-11 min-w-16 cursor-pointer rounded-full px-3 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {/* The words change, so screen readers hear the new action. */}
          {shown ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      </div>
    </FieldShell>
  );
}
