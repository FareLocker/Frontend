/*
 * The people on the About page.
 *
 * PLACEHOLDER: every value in square brackets below is a stand-in. To finish
 * the page, replace them here; nothing else needs to change.
 *
 * - The order of TEAM is the order down the page. The first person's photo
 *   is on the left, the next on the right, and so on.
 * - `photo`: put the file in public/team/ and give its address from there,
 *   e.g. "/team/sam.jpg". Use a portrait about 4 wide by 5 tall and at least
 *   760px wide; it is cropped to that shape, so keep the face near the
 *   middle. Leave `photo` out and a grey outline is shown instead.
 * - `links`: any number, including none. Each becomes a pill under the bio.
 */

export type TeamLink = {
  /** The words on the pill, e.g. "LinkedIn". */
  label: string;
  /** A full address, e.g. "https://www.linkedin.com/in/…". */
  href: string;
};

export type TeamMember = {
  name: string;
  /** What they did on FareLocker, e.g. "Frontend". */
  role: string;
  /** Two or three sentences. */
  bio: string;
  /** Address of their photo under public/, e.g. "/team/sam.jpg". */
  photo?: string;
  links: TeamLink[];
};

/** The line under "Meet the team". */
export const TEAM_INTRO =
  "Airline pricing seems to be an enigma to everyone. With recent historical events causing the price of oil to be all over the chart, we decided to build a platform that allows people to buy the travel insurance they finally want—insurance against the price of their flight. Now customers can rest easy knowing that they're protected in case the price of their flight goes down after booking.";

const BIO =
  "[BIO: two or three sentences. What this person built on FareLocker, and one thing about them outside of it.]";

export const TEAM: TeamMember[] = [
  {
    name: "Stephen Sulimani",
    role: "Pricing & Backend",
    bio: "Stephen led the modeling and pricing of FareLocker's American-option FareLocks and built the backend that serves quotes, locks, and wallets. As a Master's candidate in Georgia Tech's Quantitative and Computational Finance program, he loves working at the intersection of finance and computer science.",
    photo: "/team/stephen-sulimani.webp",
    links: [
      { label: "Website", href: "https://suli.nyc" },
      { label: "GitHub", href: "https://github.com/StephenSulimani" },
      { label: "LinkedIn", href: "https://linkedin.com/in/stephensulimani" },
    ],
  },
  { name: "[NAME 2]", role: "[ROLE]", bio: BIO, links: [] },
  { name: "[NAME 3]", role: "[ROLE]", bio: BIO, links: [] },
  { name: "[NAME 4]", role: "[ROLE]", bio: BIO, links: [] },
];
