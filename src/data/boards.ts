// Everything the board shows starts here: the workspace, people, labels,
// projects, columns and cards. Edit this file to make the template yours.
// Once someone uses the app, their changes are saved in the browser
// (localStorage). "Reset sample data" in the top bar brings this file back.

export type Member = { id: string; name: string; initials: string; tone: string };
export type Label = { id: string; name: string; color: string };
export type ChecklistItem = { id: string; text: string; done: boolean };
export type Card = {
  id: string;
  title: string;
  description: string;
  labels: string[];
  assignees: string[];
  due: string | null; // YYYY-MM-DD
  checklist: ChecklistItem[];
};
export type Column = { id: string; title: string; cardIds: string[] };
export type Board = {
  id: string;
  name: string;
  client: string;
  summary: string;
  columns: Column[];
  cards: Record<string, Card>;
};

export const workspace = {
  name: "Harbor & Pine",
  tagline: "Design studio boards",
  // Used to work out "due soon" and "overdue" in the sample data. Set to null
  // to use the real date.
  today: "2026-11-18" as string | null,
};

export const site = {
  title: "Harbor & Pine Boards",
  description:
    "Kanban boards for a small design studio: projects, columns, cards with checklists, labels, assignees and due dates.",
};

export const members: Member[] = [
  { id: "ana", name: "Ana Delgado", initials: "AD", tone: "#d9e7df" },
  { id: "theo", name: "Theo Lindqvist", initials: "TL", tone: "#e4e0d6" },
  { id: "priya", name: "Priya Raman", initials: "PR", tone: "#dfe3ec" },
  { id: "marcus", name: "Marcus Bell", initials: "MB", tone: "#ece0db" },
  { id: "june", name: "June Okoro", initials: "JO", tone: "#e6e3d1" },
];

// Label colors are the tape strips on cards. Keep them muted so the board
// stays readable; they're the only color on the page besides the accent.
export const labels: Label[] = [
  { id: "design", name: "Design", color: "#3f8f7a" },
  { id: "copy", name: "Copy", color: "#c48a1b" },
  { id: "build", name: "Build", color: "#4a6fb5" },
  { id: "client", name: "Client review", color: "#b5536b" },
  { id: "research", name: "Research", color: "#7c8a3c" },
];

const c = (
  id: string,
  title: string,
  opts: Partial<Omit<Card, "id" | "title">> & { check?: [string, boolean][] } = {},
): Card => ({
  id,
  title,
  description: opts.description ?? "",
  labels: opts.labels ?? [],
  assignees: opts.assignees ?? [],
  due: opts.due ?? null,
  checklist: (opts.check ?? []).map(([text, done], i) => ({ id: `${id}-c${i}`, text, done })),
});

const library: Card[] = [
  c("lib-1", "Audit current signage across all four branches", {
    labels: ["research"],
    assignees: ["priya"],
    due: "2026-11-14",
    description: "Photograph every exterior and wayfinding sign. Note what's damaged, what's missing and what the staff say patrons ask about most.",
    check: [["Main branch", true], ["Eastside", true], ["Mill Street", true], ["Harbor Point", true]],
  }),
  c("lib-2", "Wordmark: three directions for the first review", {
    labels: ["design"],
    assignees: ["ana", "theo"],
    due: "2026-11-20",
    description: "Serif, humanist sans and a stencil direction. Show each on the main branch facade, a library card and the website header.",
    check: [["Serif direction", true], ["Humanist sans direction", true], ["Stencil direction", false], ["Mockups on facade and card", false]],
  }),
  c("lib-3", "Write naming rationale for the board deck", {
    labels: ["copy"],
    assignees: ["june"],
    due: "2026-11-21",
    check: [["First draft", true], ["Ana's notes", false]],
  }),
  c("lib-4", "Library card front and back", {
    labels: ["design"],
    assignees: ["theo"],
    due: "2026-11-26",
    description: "Barcode stays on the back. Check the printer's bleed and the minimum size for the magnetic strip.",
    check: [["Printer spec sheet", true], ["Front layout", false], ["Back layout", false]],
  }),
  c("lib-5", "Wayfinding sign family", {
    labels: ["design", "research"],
    assignees: ["ana"],
    due: "2026-12-04",
  }),
  c("lib-6", "Color palette sign-off from the director", {
    labels: ["client"],
    assignees: ["marcus"],
    due: "2026-11-17",
    description: "Send the two palettes as printed swatches, not PDFs. The director wants to see them under the reading room lights.",
    check: [["Print swatches", true], ["Courier to main branch", true], ["Call to confirm", false]],
  }),
  c("lib-7", "Staff survey summary", {
    labels: ["research", "copy"],
    assignees: ["priya", "june"],
    check: [["Tally responses", true], ["Pull quotes", true], ["One-page summary", true]],
  }),
  c("lib-8", "Kickoff workshop with branch managers", {
    labels: ["client"],
    assignees: ["marcus", "ana"],
    check: [["Agenda", true], ["Room booked", true], ["Notes shared", true]],
  }),
  c("lib-9", "Website header and footer", {
    labels: ["build"],
    assignees: ["theo"],
    due: "2026-12-10",
  }),
  c("lib-10", "Type licensing quote for print and web", {
    labels: ["research"],
    assignees: ["marcus"],
    due: "2026-11-24",
  }),
];

const toCards = (list: Card[]) => Object.fromEntries(list.map((card) => [card.id, card]));

export const boards: Board[] = [
  {
    id: "riverside-library",
    name: "Riverside Library rebrand",
    client: "Riverside Public Library",
    summary: "New identity, library card and wayfinding for four branches.",
    columns: [
      { id: "todo", title: "To do", cardIds: ["lib-5", "lib-9", "lib-10"] },
      { id: "doing", title: "In progress", cardIds: ["lib-2", "lib-4", "lib-3"] },
      { id: "review", title: "With client", cardIds: ["lib-6"] },
      { id: "done", title: "Done", cardIds: ["lib-1", "lib-7", "lib-8"] },
    ],
    cards: toCards(library),
  },
  {
    id: "ferment-co",
    name: "Ferment & Co. packaging",
    client: "Ferment & Co.",
    summary: "Labels for six hot sauces and a gift box for the holiday run.",
    columns: [
      { id: "todo", title: "To do", cardIds: ["fer-4", "fer-5"] },
      { id: "doing", title: "In progress", cardIds: ["fer-2", "fer-3"] },
      { id: "review", title: "With client", cardIds: [] },
      { id: "done", title: "Done", cardIds: ["fer-1", "fer-6"] },
    ],
    cards: toCards([
      c("fer-1", "Label grid and die line", { labels: ["design"], assignees: ["theo"], check: [["Die line from printer", true], ["Grid", true]] }),
      c("fer-2", "Six flavor illustrations", {
        labels: ["design"],
        assignees: ["ana"],
        due: "2026-11-22",
        check: [["Habanero", true], ["Smoked chipotle", true], ["Green tomatillo", true], ["Scotch bonnet", false], ["Ghost pepper", false], ["Mango", false]],
      }),
      c("fer-3", "Back label copy and nutrition panels", { labels: ["copy"], assignees: ["june"], due: "2026-11-19" }),
      c("fer-4", "Gift box structure", { labels: ["design", "research"], assignees: ["theo"], due: "2026-12-01" }),
      c("fer-5", "Press check at the printer", { labels: ["client"], assignees: ["marcus"], due: "2026-12-08" }),
      c("fer-6", "Brand color match on kraft stock", { labels: ["research"], assignees: ["priya"] }),
    ]),
  },
  {
    id: "northline-site",
    name: "Northline Cycling website",
    client: "Northline Cycling Club",
    summary: "A small site with the ride calendar, membership and a route library.",
    columns: [
      { id: "todo", title: "To do", cardIds: ["nor-3", "nor-4", "nor-5"] },
      { id: "doing", title: "In progress", cardIds: ["nor-2"] },
      { id: "review", title: "With client", cardIds: ["nor-1"] },
      { id: "done", title: "Done", cardIds: [] },
    ],
    cards: toCards([
      c("nor-1", "Sitemap and page list", { labels: ["client"], assignees: ["marcus"], due: "2026-11-18" }),
      c("nor-2", "Ride calendar layout", { labels: ["design", "build"], assignees: ["theo", "priya"], due: "2026-11-28" }),
      c("nor-3", "Route library data model", { labels: ["build"], assignees: ["priya"] }),
      c("nor-4", "Membership page copy", { labels: ["copy"], assignees: ["june"], due: "2026-12-02" }),
      c("nor-5", "Photo day with the Saturday group", { labels: ["research"], assignees: ["ana"], due: "2026-12-06" }),
    ]),
  },
];
