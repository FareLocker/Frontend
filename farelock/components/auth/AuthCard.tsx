import type { ReactNode } from "react";
import Card from "@/components/Card";

/**
 * The card a log in or sign up form sits in: the page's heading, one line
 * under it, then the form.
 */
export default function AuthCard({
  title,
  intro,
  children,
}: {
  /** The page's main heading, e.g. "Log in". */
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex w-full max-w-[440px] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl tracking-[-0.03em]">{title}</h1>
        <p className="text-[13px] leading-normal text-muted">{intro}</p>
      </div>
      {children}
    </Card>
  );
}
