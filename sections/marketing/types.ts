// Marketing section data shapes. Mirrors the structure of Marketing_KPI_Workbook V2.
// All KPI tables share the same monthly + quarterly columns:
//   Nov | Dec | Jan | Q4 Total  ||  Feb | Mar | Apr | Q1 Total
//
// Cell values are `number | null` — null renders as "—" (no data yet).

export type Cell = number | null;

export interface KpiRow {
  /** Optional grouping column (e.g. "LinkedIn", "/product", "Organic / SEO"). */
  group?: string;
  /** Metric name (e.g. "Channel Growth", "Visitors"). */
  metric: string;
  nov: Cell;
  dec: Cell;
  jan: Cell;
  q4Total: Cell;
  feb: Cell;
  mar: Cell;
  apr: Cell;
  q1Total: Cell;
}

export interface KpiTable {
  /** Sub-section heading (e.g. "Social Metrics", "Website"). */
  title: string;
  subtitle?: string;
  /** Column header for the optional `group` column. Omit if rows have no `group`. */
  groupHeader?: string;
  rows: KpiRow[];
}

export interface BrandData {
  periodLabel: string;
  social: KpiTable;
  reputation: KpiTable;
}

export interface ProductData {
  periodLabel: string;
  website: KpiTable;
  inApp: KpiTable;
  sales: KpiTable;
}

export interface GrowthData {
  periodLabel: string;
  overallMetrics: KpiTable;
  websiteEngagement: KpiTable;
  plg: KpiTable;
  slg: KpiTable;
  cpl: KpiTable;
  cac: KpiTable;
}

export interface AdSpendsData {
  periodLabel: string;
  table: KpiTable;
}
