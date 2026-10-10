"use client";

import Link from "next/link";
import { useActionState } from "react";
import { pillClass } from "@/components/PillLink";
import type { AuthFormState } from "@/app/login/actions";

export const inputClass =
  "h-12 w-full rounded-lg border border-line bg-transparent px-4 outline-none placeholder:text-faint focus:border-foreground";

/** A labelled input. Labels sit above, small and uppercase, like the site's captions. */
export function AuthField({
  label,
  ...input
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.1em] text-muted">{label}</span>
      <input className={inputClass} {...input} />
    </label>
  );
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
  children,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  pendingLabel: string;
  footer: { text: string; linkLabel: string; href: string };
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {children}

      <p aria-live="polite" className="min-h-5 text-[13px] text-[#ff6b6b]">
        {state?.error}
      </p>

      <button
        type="submit"
        disabled={pending}
        className={`${pillClass.md} cursor-pointer disabled:cursor-wait disabled:opacity-60`}
      >
        {pending ? pendingLabel : submitLabel}
      </button>

      <p className="text-[13px] text-muted">
        {footer.text}{" "}
        <Link href={footer.href} className="text-foreground underline underline-offset-4">
          {footer.linkLabel}
        </Link>
      </p>
    </form>
  );
}
