// Generates JSON data files for the Marketing section from the source workbook
// shape (Marketing_KPI_Workbook V2). Until real data lands, Brand/Product/Growth
// are scaffolded with zeros (per the empty workbook), and Ad Spends uses the
// few actual values from the workbook (null = "—" in the UI).
//
// Run: node sections/marketing/process.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../../data/marketing");
mkdirSync(OUT_DIR, { recursive: true });

const PERIOD_LABEL = "Q1 FY2027";

// Build a row with all cells = 0 (workbook scaffold).
function zeroRow(metric, group) {
  return {
    ...(group ? { group } : {}),
    metric,
    nov: 0, dec: 0, jan: 0, q4Total: 0,
    feb: 0, mar: 0, apr: 0, q1Total: 0,
  };
}

// Build a row with values, auto-computing Q-totals from present cells.
// Pass null/undefined for missing cells.
function valueRow(metric, group, cells) {
  const c = {
    nov: cells.nov ?? null, dec: cells.dec ?? null, jan: cells.jan ?? null,
    feb: cells.feb ?? null, mar: cells.mar ?? null, apr: cells.apr ?? null,
  };
  const sum = (...keys) => {
    const present = keys.map((k) => c[k]).filter((v) => v !== null);
    return present.length ? present.reduce((s, n) => s + n, 0) : null;
  };
  return {
    ...(group ? { group } : {}),
    metric,
    ...c,
    q4Total: sum("nov", "dec", "jan"),
    q1Total: sum("feb", "mar", "apr"),
  };
}

// Cross-product: for each platform × each metric, emit a zero row.
function crossZeros(platforms, metrics) {
  return platforms.flatMap((p) => metrics.map((m) => zeroRow(m, p)));
}

// ─────────────────── BRAND ───────────────────
const brand = {
  periodLabel: PERIOD_LABEL,
  social: {
    title: "Social Metrics",
    groupHeader: "Channel / Platform",
    rows: crossZeros(
      ["LinkedIn", "Instagram", "YouTube"],
      ["Channel Growth", "Impressions", "Comments", "Mentions"],
    ),
  },
  reputation: {
    title: "Online Reputation",
    groupHeader: "Channel / Platform",
    rows: crossZeros(
      ["G2", "TrustRadius", "Capterra", "Google"],
      ["Positive Reviews", "Negative Reviews"],
    ),
  },
};

// ─────────────────── PRODUCT ───────────────────
const product = {
  periodLabel: PERIOD_LABEL,
  website: {
    title: "Website",
    groupHeader: "Page",
    rows: crossZeros(
      ["/product", "/team", "/solution", "/industry"],
      ["Visitors", "Engagement Rate", "# of transitions to signup page", "# of transitions to demo page"],
    ),
  },
  inApp: {
    title: "Product / In-App",
    rows: [
      zeroRow("Activation Rate"),
      zeroRow("Onboarding Completion Rate"),
      zeroRow("Trial to Conversion Rate"),
    ],
  },
  sales: {
    title: "Sales",
    rows: [
      zeroRow("Seller Confidence Survey"),
      zeroRow("Deal Velocity"),
      zeroRow("Win Rate"),
      zeroRow("ACV"),
      zeroRow("AIVA Attach Rate"),
    ],
  },
};

// ─────────────────── GROWTH ───────────────────
const CHANNELS = ["Organic / SEO", "Paid Search", "Paid Social", "Email", "Direct / Referral"];

const growth = {
  periodLabel: PERIOD_LABEL,
  websiteEngagement: {
    title: "Website Engagement (Overall)",
    rows: [
      zeroRow("Visitors"),
      zeroRow("Engagement Rate"),
      zeroRow("Average time per user per page"),
      zeroRow("Average # of pages per visitor"),
    ],
  },
  plg: {
    title: "PLG (SignUps)",
    groupHeader: "Channel",
    rows: crossZeros(CHANNELS, ["Traffic to signup page", "Num of SignUps", "Trials", "PLG Customers"]),
  },
  slg: {
    title: "SLG (Demos)",
    groupHeader: "Channel",
    rows: crossZeros(CHANNELS, ["Traffic to demo page", "Num of demos", "S1", "S2", "Closed Won"]),
  },
  aiSdr: {
    title: "AI SDR",
    groupHeader: "Channel",
    rows: crossZeros(CHANNELS, ["# of inbound calls", "# of warm transfers", "S1", "S2", "Closed Won"]),
  },
  customPricing: {
    title: "Custom Pricing / Get a Quote",
    groupHeader: "Channel",
    rows: crossZeros(CHANNELS, ["# of visitors to pricing page", "# of leads", "S1", "S2", "Closed Wons"]),
  },
  cpl: {
    title: "Efficiency & Economics — CPL",
    rows: [zeroRow("Paid"), zeroRow("Blended")],
  },
  cac: {
    title: "Efficiency & Economics — CAC",
    rows: [
      zeroRow("Paid CAC"),
      zeroRow("Paid + Direct CAC"),
      zeroRow("Paid + Direct + SEO CAC"),
    ],
  },
};

// ─────────────────── AD SPENDS ───────────────────
// Real values from the workbook (missing cells = null → "—" in UI).
const adSpends = {
  periodLabel: PERIOD_LABEL,
  table: {
    title: "Ad Spends",
    subtitle: "Monthly paid media spend by channel (USD). Cells marked — have no data in the source workbook.",
    groupHeader: "Channel",
    rows: [
      valueRow("Spend (USD)", "GAds", { jan: 54319.05, feb: 14338.10, mar: 49762.89, apr: 2778.34 }),
      valueRow("Spend (USD)", "Meta", { nov: 703.36, dec: 5404.92, feb: 62422.05, mar: 55426.78, apr: 30257.42 }),
      valueRow("Spend (USD)", "LinkedIn", {}),
    ],
  },
};

// ─────────────────── WRITE ───────────────────
const files = [
  ["brand-q1-fy2026.json", brand],
  ["product-q1-fy2026.json", product],
  ["growth-q1-fy2026.json", growth],
  ["ad-spends-q1-fy2026.json", adSpends],
];

for (const [name, data] of files) {
  const path = resolve(OUT_DIR, name);
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`wrote ${name}`);
}
