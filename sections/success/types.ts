// Types for the Customer Success section.

// ---------- 1. MRR Change (Net Expansions) ----------
// Shape of one P&L sub-table (New customers / Existing customers / Total).
export interface MrrChangeTable {
  months: string[]; // ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026"]
  starting_mrr?: (number | null)[];
  new?: (number | null)[];
  expansion?: (number | null)[];
  downgrade?: (number | null)[];
  churn?: (number | null)[];
  reactivation?: (number | null)[];
  closing_mrr?: (number | null)[];
  net_expansions?: (number | null)[];
  net_expansion_pct?: (number | null)[];
  expansion_pct?: (number | null)[];
  downgrade_pct?: (number | null)[];
  churn_pct?: (number | null)[];
}

export interface MrrChangeSegment {
  new_customers: MrrChangeTable | null;
  existing_customers: MrrChangeTable | null;
  total: MrrChangeTable | null;
}

export interface MrrChangeData {
  total: MrrChangeSegment;     // from Overall xlsx
  scaled: MrrChangeSegment;    // from Growth Retention xlsx
  strategic: MrrChangeSegment; // from Strategic CS xlsx
}

// ---------- 2. Success Metrics (Customer Movements) ----------
export interface SuccessMetricsData {
  months: string[]; // ["2026-02-01", "2026-03-01", "2026-04-01"]
  plan_upgrades: number[];
  m2a: number[];
  a2m: number[];
  aiva_activations: number[];
  aiva_deactivations: number[];
}

// ---------- 3. Product Adoption ----------
export interface ProductAdoptionRow {
  module_group: string | null;   // e.g. "Voice Module" — null for the Customer base row
  metric: string;                // e.g. "Overall Voice Non-Zero users"
  values: (number | null)[];     // length matches months
  is_customer_base: boolean;     // true for the section's "Customer base" summary row
}

export interface ProductAdoptionData {
  months: string[]; // ["Jan 2026" .. "May 2026"]
  cohorts: {
    new?: ProductAdoptionRow[];
    existing?: ProductAdoptionRow[];
    total?: ProductAdoptionRow[];
  };
}

// ---------- 4 & 5. Expansion Pipeline ----------
export interface PipelineStageRow {
  stage: string;
  deals: number;
  amount: number;
}

export interface PipelineCohort {
  total: number;
  totalAmount: number;
  byStage: PipelineStageRow[];
}

export interface ExpansionPipelineSegment {
  createdInQ1: PipelineCohort;
  closedInQ1: PipelineCohort;
  openIntoQ2: PipelineCohort;
}

export interface ExpansionPipelineData {
  all: ExpansionPipelineSegment;
  aiva: ExpansionPipelineSegment;
}

// ---------- 6. NRR Deepdive ----------
// One trend point per cohort, plus the full cohort matrices (absolute + %)
// transcribed verbatim from the source PDFs (Revenue + License Cohort Analysis).

export interface CohortPoint {
  cohort: string;
  pct: number;
  numerator?: number | null;
  denominator?: number | null;
}

export interface CohortMatrix {
  title: string;
  monthHeaders: string[];               // ["M0", "M1", ..., "Mn"]
  rows: {
    cohort: string;                     // "Dec 24"
    start: number | null;               // Start column value (raw; renderer formats)
    values: number[];                   // M0..M(k); shorter rows = unfilled cells
  }[];
}

export interface NrrDeepdiveData {
  existing12m: {
    title: string;
    subtitle: string;
    trend: CohortPoint[];
    nrrAbsolute: CohortMatrix;
    nrrPercent: CohortMatrix;
  };
  threeMonth: {
    title: string;
    subtitle: string;
    nrrTrend: CohortPoint[];
    logoTrend: CohortPoint[];
    logoAbsolute: CohortMatrix;
    logoPercent: CohortMatrix;
    nrrAbsolute: CohortMatrix;
    nrrPercent: CohortMatrix;
  };
  newCustomers12m: {
    title: string;
    subtitle: string;
    trend: CohortPoint[];
    nrrAbsolute: CohortMatrix;
    nrrPercent: CohortMatrix;
  };
}
