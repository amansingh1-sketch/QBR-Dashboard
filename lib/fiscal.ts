import type { FiscalQuarter } from "./types";

/**
 * Fiscal year quarters (non-standard):
 *   Q1 = Feb 1 – Apr 30
 *   Q2 = May 1 – Jul 31
 *   Q3 = Aug 1 – Oct 31
 *   Q4 = Nov 1 – Jan 31 (end year = start year + 1)
 *
 * The "year" refers to the calendar year in which the quarter starts.
 */
export function getFiscalQuarterDates(
  quarter: 1 | 2 | 3 | 4,
  year: number
): FiscalQuarter {
  let startDate: string;
  let endDate: string;

  switch (quarter) {
    case 1:
      startDate = `${year}-02-01`;
      endDate = `${year}-04-30`;
      break;
    case 2:
      startDate = `${year}-05-01`;
      endDate = `${year}-07-31`;
      break;
    case 3:
      startDate = `${year}-08-01`;
      endDate = `${year}-10-31`;
      break;
    case 4:
      startDate = `${year}-11-01`;
      endDate = `${year + 1}-01-31`;
      break;
  }

  return {
    quarter,
    year,
    startDate,
    endDate,
    label: `Q${quarter} FY${year}`,
  };
}

/**
 * Given a date (YYYY-MM-DD), returns the fiscal quarter and year.
 */
export function getFiscalQuarterFromDate(
  dateStr: string
): { quarter: 1 | 2 | 3 | 4; year: number } {
  const [yearStr, monthStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  if (month >= 2 && month <= 4) return { quarter: 1, year };
  if (month >= 5 && month <= 7) return { quarter: 2, year };
  if (month >= 8 && month <= 10) return { quarter: 3, year };
  // Nov-Jan → Q4, year = start year (Nov/Dec) or prior year (Jan)
  if (month === 11 || month === 12) return { quarter: 4, year };
  // month === 1
  return { quarter: 4, year: year - 1 };
}

/**
 * Returns the immediately preceding fiscal quarter.
 */
export function getPreviousFiscalQuarter(
  quarter: 1 | 2 | 3 | 4,
  year: number
): { quarter: 1 | 2 | 3 | 4; year: number } {
  if (quarter === 1) return { quarter: 4, year: year - 1 };
  return { quarter: (quarter - 1) as 1 | 2 | 3 | 4, year };
}

/**
 * Returns the same quarter in the prior fiscal year.
 */
export function getSameQuarterPriorYear(
  quarter: 1 | 2 | 3 | 4,
  year: number
): { quarter: 1 | 2 | 3 | 4; year: number } {
  return { quarter, year: year - 1 };
}

/**
 * Returns the most recently completed fiscal quarter based on today's date.
 */
export function getCurrentFiscalQuarter(): { quarter: 1 | 2 | 3 | 4; year: number } {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-12
  const year = today.getFullYear();
  return getFiscalQuarterFromDate(
    `${year}-${String(month).padStart(2, "0")}-01`
  );
}
