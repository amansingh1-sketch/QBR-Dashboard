"use server";

import type { BrandData, ProductData, GrowthData, AdSpendsData, KpiRow, KpiTable } from "./types";

const SPREADSHEET_ID = "1DmOK2lbYiOlBsoGLeIaFBaKFhj48nfVgjHnm3i7zyXU";
const PERIOD_LABEL = "Q1 FY2027";

export interface RefreshResult {
  brand: BrandData;
  product: ProductData;
  growth: GrowthData;
  adSpends: AdSpendsData;
}

export async function refreshMarketingData(): Promise<
  { ok: true; data: RefreshResult } | { ok: false; error: string }
> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "GOOGLE_SHEETS_API_KEY not configured. Add it to .env.local and Vercel env vars." };
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:K?key=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Google Sheets API ${res.status}: ${body.slice(0, 200)}` };
    }

    const json = await res.json();
    const values: string[][] = json.values || [];
    const data = parseSheetData(values);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: `Fetch failed: ${(e as Error).message}` };
  }
}

// --- Parsing ---

function parseNum(s: string | undefined): number | null {
  if (s === undefined || s === null) return null;
  const trimmed = s.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "—") return null;
  const cleaned = trimmed.replace(/[$,%]/g, "").replace(/,/g, "");
  if (cleaned.includes(":")) return null; // time values like "2:06"
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function isHeaderRow(row: string[]): boolean {
  if (!row || row.length < 4) return false;
  const joined = row.map((c) => c?.trim() ?? "");
  const hasMetricOrChannel =
    joined.includes("Metric") || (joined[0] === "Channel" && joined.some((c) => c === "Nov"));
  const hasMonth = joined.some((c) => ["Nov", "N"].includes(c));
  return hasMetricOrChannel && hasMonth;
}

interface RawSection {
  headers: string[];
  rows: string[][];
}

function splitIntoSections(values: string[][]): RawSection[] {
  const sections: RawSection[] = [];
  let currentHeaders: string[] | null = null;
  let currentRows: string[][] = [];

  for (const row of values) {
    if (!row || row.length === 0 || row.every((c) => !c || c.trim() === "")) {
      if (currentHeaders && currentRows.length > 0) {
        sections.push({ headers: currentHeaders, rows: currentRows });
        currentHeaders = null;
        currentRows = [];
      }
      continue;
    }

    if (isHeaderRow(row)) {
      if (currentHeaders && currentRows.length > 0) {
        sections.push({ headers: currentHeaders, rows: currentRows });
      }
      currentHeaders = row.map((c) => c?.trim() ?? "");
      currentRows = [];
      continue;
    }

    if (currentHeaders) {
      currentRows.push(row);
    }
  }

  if (currentHeaders && currentRows.length > 0) {
    sections.push({ headers: currentHeaders, rows: currentRows });
  }

  return sections;
}

function findMonthIdx(headers: string[]): number {
  const idx = headers.findIndex((h) => h === "Nov" || h === "N");
  return idx >= 0 ? idx : headers.length;
}

function buildKpiRow(
  headers: string[],
  row: string[],
  monthIdx: number,
  metricIdx: number,
  groupIdx: number,
): KpiRow {
  const base: KpiRow = {
    metric: row[metricIdx]?.trim() ?? "",
    nov: parseNum(row[monthIdx]),
    dec: parseNum(row[monthIdx + 1]),
    jan: parseNum(row[monthIdx + 2]),
    q4Total: parseNum(row[monthIdx + 3]),
    feb: parseNum(row[monthIdx + 4]),
    mar: parseNum(row[monthIdx + 5]),
    apr: parseNum(row[monthIdx + 6]),
    q1Total: parseNum(row[monthIdx + 7]),
  };
  if (groupIdx >= 0 && row[groupIdx]?.trim()) {
    base.group = row[groupIdx].trim();
  }
  return base;
}

function sectionToTable(section: RawSection, title: string, groupHeader?: string): KpiTable {
  const headers = section.headers;
  const metricIdx = headers.indexOf("Metric");
  const monthIdx = findMonthIdx(headers);

  let groupIdx = -1;
  if (groupHeader) {
    groupIdx = headers.findIndex(
      (h) => h === groupHeader || h === "Channel / Platform" || h === "Channel" || h === "Page",
    );
  }

  const rows: KpiRow[] = [];
  let lastGroup = "";
  for (const row of section.rows) {
    const kpiRow = buildKpiRow(headers, row, monthIdx, metricIdx, groupIdx);
    if (groupIdx >= 0) {
      if (kpiRow.group) lastGroup = kpiRow.group;
      else kpiRow.group = lastGroup;
    }
    if (kpiRow.metric) rows.push(kpiRow);
  }

  const table: KpiTable = { title, rows };
  if (groupHeader) table.groupHeader = groupHeader;
  return table;
}

function parseAdSpendsSection(section: RawSection): KpiTable {
  const headers = section.headers;
  const monthIdx = 1; // Channel | Nov | Dec | ...
  const rows: KpiRow[] = section.rows.map((row) => {
    const channel = row[0]?.trim().replace("Google", "GAds") ?? "";
    return {
      group: channel,
      metric: "Spend (USD)",
      nov: parseNum(row[monthIdx]),
      dec: parseNum(row[monthIdx + 1]),
      jan: parseNum(row[monthIdx + 2]),
      q4Total: parseNum(row[monthIdx + 3]),
      feb: parseNum(row[monthIdx + 4]),
      mar: parseNum(row[monthIdx + 5]),
      apr: parseNum(row[monthIdx + 6]),
      q1Total: parseNum(row[monthIdx + 7]),
    };
  });
  return { title: "Ad Spends", subtitle: "Monthly paid media spend by channel (USD).", groupHeader: "Channel", rows };
}

function parseSheetData(values: string[][]): RefreshResult {
  const sections = splitIntoSections(values);

  const brand: BrandData = {
    periodLabel: PERIOD_LABEL,
    social: { title: "Social Metrics", groupHeader: "Channel / Platform", rows: [] },
    reputation: { title: "Online Reputation", groupHeader: "Channel / Platform", rows: [] },
  };
  const product: ProductData = {
    periodLabel: PERIOD_LABEL,
    website: { title: "Website", groupHeader: "Page", rows: [] },
    inApp: { title: "Product / In-App", rows: [] },
    sales: { title: "Sales", rows: [] },
  };
  const growth: GrowthData = {
    periodLabel: PERIOD_LABEL,
    websiteEngagement: { title: "Website Engagement (Overall)", rows: [] },
    plg: { title: "PLG (SignUps)", groupHeader: "Channel", rows: [] },
    slg: { title: "SLG (Demos)", groupHeader: "Channel", rows: [] },
    aiSdr: { title: "AI SDR", groupHeader: "Channel", rows: [] },
    customPricing: { title: "Custom Pricing / Get a Quote", groupHeader: "Channel", rows: [] },
    cpl: { title: "Efficiency & Economics — CPL", rows: [] },
    cac: { title: "Efficiency & Economics — CAC", rows: [] },
  };
  const adSpends: AdSpendsData = {
    periodLabel: PERIOD_LABEL,
    table: { title: "Ad Spends", rows: [] },
  };

  for (const section of sections) {
    const firstDataRow = section.rows[0];
    if (!firstDataRow) continue;

    const kpiGroup = firstDataRow[0]?.trim() ?? "";
    const headers = section.headers;
    const isAdSpendHeader = headers[0] === "Channel" && !headers.includes("Metric");

    if (isAdSpendHeader) {
      adSpends.table = parseAdSpendsSection(section);
    } else if (kpiGroup === "Social") {
      brand.social = sectionToTable(section, "Social Metrics", "Channel / Platform");
    } else if (kpiGroup === "Online Reputation") {
      brand.reputation = sectionToTable(section, "Online Reputation", "Channel / Platform");
    } else if (kpiGroup === "Website") {
      product.website = sectionToTable(section, "Website", "Page");
    } else if (kpiGroup === "Sales") {
      product.sales = sectionToTable(section, "Sales");
    } else if (kpiGroup === "PLG (SignUps)" || kpiGroup.startsWith("PLG")) {
      growth.plg = sectionToTable(section, "PLG (SignUps)", "Channel");
    } else if (kpiGroup === "SLG (Demos)" || kpiGroup.startsWith("SLG")) {
      growth.slg = sectionToTable(section, "SLG (Demos)", "Channel");
    } else if (kpiGroup === "AI-SDR" || kpiGroup.startsWith("AI")) {
      growth.aiSdr = sectionToTable(section, "AI SDR", "Channel");
    } else if (kpiGroup.startsWith("Custom Pricing")) {
      growth.customPricing = sectionToTable(section, "Custom Pricing / Get a Quote", "Channel");
    } else if (kpiGroup === "Website Engagement") {
      growth.websiteEngagement = sectionToTable(section, "Website Engagement (Overall)");
    } else if (kpiGroup === "CPL") {
      growth.cpl = sectionToTable(section, "Efficiency & Economics — CPL");
    } else if (kpiGroup === "CAC") {
      growth.cac = sectionToTable(section, "Efficiency & Economics — CAC");
    } else {
      // Fallback: check if this section has "Activation Rate" → product.inApp
      const hasActivation = section.rows.some(
        (r) => r.some((c) => c?.trim() === "Activation Rate"),
      );
      if (hasActivation) {
        const metricIdx = headers.indexOf("Metric");
        const monthIdx = findMonthIdx(headers);
        product.inApp = {
          title: "Product / In-App",
          rows: section.rows
            .filter((r) => r[metricIdx]?.trim())
            .map((r) => buildKpiRow(headers, r, monthIdx, metricIdx, -1)),
        };
      }
    }
  }

  return { brand, product, growth, adSpends };
}
