// Tab metadata for the Sales section. Imported by the global Sidebar (no React deps here).

export const SALES_TABS = [
  { id: "s2",          label: "S2 Pipeline" },
  { id: "s1s2",        label: "S1→S2%" },
  { id: "winrate",     label: "Win Rate" },
  { id: "bookings",    label: "Bookings" },
  { id: "acv",         label: "ACV" },
  { id: "salescycle",  label: "Sales Cycle" },
  { id: "winreasons",  label: "Win Reasons" },
  { id: "lossreasons", label: "Loss Reasons" },
] as const;

export type SalesTabId = (typeof SALES_TABS)[number]["id"];

export const SALES_TAB_IDS = new Set<string>(SALES_TABS.map((t) => t.id));
