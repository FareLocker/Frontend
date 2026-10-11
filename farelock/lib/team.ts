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
  {
    name: "Andrew Babatunde",
    role: "Backend",
    bio: "Andrew built out FareLocker’s backend and led the Photon integration that lets people use FareLocker over iMessage. He also helped wire in the Google Gemini API so those chats can understand natural language. A senior Computer Science student at the University of Georgia, he likes turning real products into channels people already use every day.",
    photo: "/team/babatunde.jpg",
    links: [
      { label: "Website", href: "https://andrvew.dev/" },
      { label: "GitHub", href: "https://github.com/andrew-babatunde2004" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/andrewbabatunde",
      },
    ],
  },
  {
    name: "Seth Voisine",
    role: "Frontend",
    bio: "Seth shaped FareLocker’s look and feel, meticulously building out the pages, motion, and shared components that hold the product together. A senior Computer Science student at the University of Georgia, he loves when interface craft turns a technical idea into something people actually enjoy using.",

    photo: "/team/seth.jpg",
    links: [
      { label: "GitHub", href: "https://github.com/svoisine" },
      { label: "LinkedIn", href: "https://linkedin.com/in/svoisine" },
    ],
  },
  {
    name: "Aiden Goff",
    role: "Frontend",
    bio: "Aiden partnered with Seth to build out FareLocker’s user interface, and led the Google Gemini integration that brings the FareLocker agent to life on iMessage. A junior Computer Science student at the University of Georgia, he likes shipping interfaces that feel as smart as the systems behind them.",
    photo: "/team/aiden.jpg",
    links: [
      { label: "GitHub", href: "https://github.com/mechaiden" },
      { label: "LinkedIn", href: "https://linkedin.com/in/aidengoff" },
    ],
  },
];
