import type { ReactNode } from "react";
import Container from "@/components/Container";
import Label from "@/components/Label";

/**
 * The landing page's main section layout: a small label in the left margin
 * and the content in the right two thirds (12-column grid; stacks on a phone).
 */
export default function SplitSection({
  id,
  label,
  children,
  ruleAbove = true,
}: {
  id?: string;
  label: string;
  children: ReactNode;
  /** Draw the hairline above the section. Turn off after a bordered panel. */
  ruleAbove?: boolean;
}) {
  return (
    <section id={id} className={ruleAbove ? "border-t border-line" : undefined}>
      <Container className="grid gap-8 py-20 md:grid-cols-12 md:py-32">
        <div className="md:col-span-3">
          <Label>{label}</Label>
        </div>
        <div className="md:col-span-8 md:col-start-5">{children}</div>
      </Container>
    </section>
  );
}
