// Tab metadata for the Marketing section.

export const MARKETING_TABS = [
  { id: "brand",       label: "Brand" },
  { id: "mkt-product", label: "Product" },
  { id: "growth",      label: "Growth" },
] as const;

export type MarketingTabId = (typeof MARKETING_TABS)[number]["id"];

export const MARKETING_TAB_IDS = new Set<string>(MARKETING_TABS.map((t) => t.id));
