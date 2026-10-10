import { pillClass } from "@/components/PillLink";

/**
 * "Continue with Google", with an "or" rule under it to separate it from the
 * email form.
 *
 * LATER (Google sign-in): the button does nothing yet. It is type="button",
 * so pressing it does not submit the form it sits in. When the backend
 * supports Google sign-in, start that flow from here, most likely by turning
 * this into a link to the backend's Google sign-in address.
 */
export default function GoogleButton() {
  return (
    <>
      <button type="button" className={`${pillClass.md} w-full cursor-pointer`}>
        Continue with Google
      </button>
      <div
        aria-hidden
        className="flex items-center gap-3 text-[11px] uppercase tracking-[0.1em] text-muted"
      >
        <span className="h-px flex-1 bg-foreground/10" />
        or
        <span className="h-px flex-1 bg-foreground/10" />
      </div>
    </>
  );
}
