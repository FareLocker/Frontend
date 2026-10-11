"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { solidButtonClass } from "@/components/PillLink";
import TextField, { fieldInputClass } from "@/components/TextField";
import type { AuthFormState } from "@/app/login/actions";
import FormError from "./FormError";

/*
 * Update 02 styling: the inputs now share TextField's look (rounded, dark
 * box, small uppercase label), errors use FormError, and the submit button is
 * the solid one. How the form runs (useActionState over the team's logIn /
 * register actions) is unchanged.
 */

/** Kept for anything that still wants the input look on its own. */
export const inputClass = fieldInputClass;

/**
 * A labelled input. Labels sit above, small and uppercase, like the site's
 * captions. Now a thin wrapper over TextField, so it also takes `optional`
 * and `hint`.
 */
export function AuthField(props: React.ComponentProps<typeof TextField>) {
  return <TextField {...props} />;
}

/**
 * The shared shell of the login and register forms: runs the Server Action,
 * shows its error, and disables the button while it runs.
 */
export default function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  footer,
  note,
  children,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  pendingLabel: string;
  footer: { text: string; linkLabel: string; href: string };
  /** Small print under the button, e.g. the Terms line on register. */
  note?: ReactNode;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {children}

      {/* Same live-region job as before; FormError has role="alert". */}
      {state?.error ? <FormError>{state.error}</FormError> : null}

      <button
        type="submit"
        disabled={pending}
        className={`${solidButtonClass} w-full disabled:cursor-wait disabled:opacity-60`}
      >
        {pending ? pendingLabel : submitLabel}
      </button>

      {note}

      <p className="text-center text-[13px] text-muted">
        {footer.text}{" "}
        <Link href={footer.href} className="text-foreground underline underline-offset-4 max-md:inline-flex max-md:min-h-11 max-md:items-center">
          {footer.linkLabel}
        </Link>
      </p>
    </form>
  );
}
