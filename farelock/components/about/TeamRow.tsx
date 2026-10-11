import Image from "next/image";
import Label from "@/components/Label";
import { pillClass } from "@/components/PillLink";
import type { TeamMember } from "@/lib/team";

/**
 * One person on the About page: their photo beside their name, role, bio
 * and links.
 *
 * Rows alternate. On even rows (the first, third, …) the photo is on the
 * left; on odd rows it is on the right. On a narrow screen the two halves
 * stack, photo first, whichever side it was on.
 */
export default function TeamRow({
  member,
  index,
}: {
  member: TeamMember;
  /** Position in the list, from 0. Decides the side and the number shown. */
  index: number;
}) {
  const photoOnRight = index % 2 === 1;

  return (
    <article
      className={`flex flex-wrap items-center gap-x-[72px] gap-y-10 py-[72px] max-md:gap-y-7 max-md:py-12 ${
        photoOnRight ? "flex-row-reverse" : ""
      } ${index > 0 ? "border-t border-line" : ""}`}
    >
      <Headshot member={member} />

      {/* data-plane-quiet: the planes dim where they pass behind this text. */}
      <div
        data-plane-quiet
        className="flex min-w-0 max-w-[560px] flex-1 basis-[360px] flex-col gap-[18px]"
      >
        <Label className="text-accent">{String(index + 1).padStart(2, "0")}</Label>
        <h2 className="text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-[-0.03em]">
          {member.name}
        </h2>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
          {member.role}
        </p>
        <p className="leading-[1.6] text-soft">{member.bio}</p>
        {member.links.length > 0 ? (
          <ul className="flex flex-wrap gap-2 pt-1.5">
            {member.links.map((link) => (
              <li key={link.href}>
                {/* These leave the site, so a plain link, in a new tab. */}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${pillClass.md} bg-background/70`}
                >
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

/** The 4:5 portrait, or a grey outline of a person until there is one. */
function Headshot({ member }: { member: TeamMember }) {
  const frame =
    "relative aspect-[4/5] w-[380px] max-w-full shrink-0 overflow-hidden rounded-[2rem] bg-card max-md:w-[220px] max-md:rounded-3xl";

  if (member.photo) {
    return (
      <div className={`${frame} border border-foreground/10`}>
        <Image
          src={member.photo}
          alt={`Portrait of ${member.name}`}
          fill
          // 380px wide beside the text; the full column once they stack.
          sizes="(min-width: 768px) 380px, 220px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`${frame} flex items-end justify-center border border-dashed border-foreground/35`}
    >
      <svg viewBox="0 0 300 360" className="w-[79%] fill-foreground/10">
        <circle cx="150" cy="130" r="74" />
        <path d="M10 360C10 262 72 222 150 222s140 40 140 138Z" />
      </svg>
    </div>
  );
}
