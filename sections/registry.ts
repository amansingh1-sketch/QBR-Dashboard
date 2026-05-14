// Master section registry. Each entry describes one team's section in the QBR.
// Adding a new section: scaffold sections/<slug>/, then add a row here.

import type { LucideIcon } from "lucide-react";
import { TrendingUp, Heart, Megaphone } from "lucide-react";
import { SALES_TABS } from "./sales/tabs";
import { MARKETING_TABS } from "./marketing/tabs";
import { TABS as SUCCESS_TABS } from "./success/tabs";

export interface SectionEntry {
  id: string;
  label: string;
  enabled: boolean;
  icon: LucideIcon;
  tabs: ReadonlyArray<{ id: string; label: string }>;
}

export const SECTIONS: SectionEntry[] = [
  { id: "sales",     label: "Sales",            enabled: true, icon: TrendingUp, tabs: SALES_TABS },
  { id: "success",   label: "Customer Success", enabled: true, icon: Heart,      tabs: SUCCESS_TABS },
  { id: "marketing", label: "Marketing",        enabled: true, icon: Megaphone,  tabs: MARKETING_TABS },
];

export const ALL_TAB_IDS: Set<string> = new Set(
  SECTIONS.flatMap((s) => s.tabs.map((t) => t.id)),
);

export function findSectionByTabId(tabId: string): SectionEntry | undefined {
  return SECTIONS.find((s) => s.tabs.some((t) => t.id === tabId));
}
