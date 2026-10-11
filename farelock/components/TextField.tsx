import { useId, type ComponentProps, type ReactNode } from "react";

/** The look of a text box. Exported so other kinds of field can match it. */
export const fieldInputClass =
  "h-[52px] w-full rounded-2xl border border-foreground/15 bg-pitch px-[18px] text-[0.95rem] placeholder:text-muted/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/**
 * Everything around a form control: its label, an "Optional" tag, a hint
 * line and an error line. TextField uses it; so does PasswordField, which
 * needs the same frame around a different control.
 *
 * `controlId` is the id of the control inside. The hint and error lines get
 * the ids `${controlId}-hint` and `${controlId}-error`; point the control's
 * aria-describedby at whichever are shown (describedBy() below does this).
 */
export function FieldShell({
  controlId,
  label,
  optional = false,
  hint,
  error,
  children,
}: {
  controlId: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={controlId}
        className="flex items-baseline justify-between gap-3 text-[11px] uppercase tracking-[0.1em] text-muted"
      >
        {label}{" "}
        {optional ? <span>Optional</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${controlId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {/*
       * The palette has no colour for errors yet, so the accent stands in.
       * Nothing passes `error` today; it is here for whoever wires up
       * validation.
       */}
      {error ? (
        <p id={`${controlId}-error`} className="text-xs font-semibold text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** The aria-describedby value for a control inside a FieldShell. */
export function describedBy(controlId: string, hint?: ReactNode, error?: string) {
  const ids = [hint ? `${controlId}-hint` : "", error ? `${controlId}-error` : ""];
  return ids.filter(Boolean).join(" ") || undefined;
}

/**
 * A labelled text box.
 *
 *   <TextField label="Email" name="email" type="email" autoComplete="email" />
 *
 * It takes every attribute a plain <input> does (name, type, placeholder,
 * required, defaultValue, …) plus the four below.
 */
export default function TextField({
  label,
  optional,
  hint,
  error,
  ...input
}: {
  label: string;
  /** Shows an "Optional" tag beside the label. */
  optional?: boolean;
  /** A quiet line under the box, e.g. what the value is used for. */
  hint?: ReactNode;
  /** A message under the box when the value was rejected. */
  error?: string;
} & Omit<ComponentProps<"input">, "id" | "className">) {
  const id = useId();
  return (
    <FieldShell controlId={id} label={label} optional={optional} hint={hint} error={error}>
      <input
        {...input}
        id={id}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={fieldInputClass}
      />
    </FieldShell>
  );
}
