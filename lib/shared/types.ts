export interface FiscalQuarter {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;     // e.g. "Q1 FY2026"
}
