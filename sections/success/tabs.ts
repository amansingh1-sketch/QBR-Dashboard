// Tab metadata for the Customer Success section.

export const SUCCESS_TABS = [
  { id: "net-expansions",        label: "Net Expansions" },
  { id: "success-metrics",       label: "Success Metrics" },
  { id: "product-adoption",      label: "Product Adoption" },
  { id: "expansion-pipeline",    label: "Expansion Pipeline" },
  { id: "aiva-pipeline",         label: "AIVA Expansion Pipeline" },
  { id: "nrr-deepdive",          label: "NRR Deepdive" },
] as const;

export type SuccessTabId = (typeof SUCCESS_TABS)[number]["id"];

// Re-export under the generic name so registry.ts can keep importing TABS.
export const TABS = SUCCESS_TABS;
