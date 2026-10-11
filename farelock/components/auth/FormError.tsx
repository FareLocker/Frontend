/**
 * The line a form shows when the server turned the attempt down, e.g.
 * "That email, phone number or password isn't right."
 *
 * role="alert" makes screen readers read it out when it appears.
 */
export default function FormError({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="rounded-2xl bg-raised px-[18px] py-3.5 text-[13px] leading-normal font-semibold text-accent"
    >
      {children}
    </p>
  );
}
