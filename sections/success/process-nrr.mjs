// Generates data/success/nrr-deepdive.json from the source cohort PDFs.
//
//   - Revenue Cohort Analysis (Net $ Retention, absolute + %)
//   - License Cohort Analysis (Logo Retention + Net $ Retention, absolute + %)
//
// All cohort values are transcribed from the PDFs verbatim (rounded to whole %
// for the % views, $K or raw counts for the absolute views).
//
// Run: node sections/success/process-nrr.mjs

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../../data/success/nrr-deepdive.json");

// Cohorts in order (matches the PDFs).
const COHORTS = [
  "Dec 24", "Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25",
  "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25",
  "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26",
];

// ─────────────────── Revenue Cohort Analysis ───────────────────

// Revenue Net $ Retention — absolute, in $K (Start values then M0..Mn).
// Each row: { start, values: [M0..Mn] }
const REV_NRR_ABS = {
  "Dec 24": { start: 1709, values: [1709, 1668, 1657, 1631, 1610, 1597, 1582, 1553, 1605, 1596, 1572, 1552, 1517, 1536, 1533, 1532, 1548] },
  "Jan 25": { start: 1734, values: [1734, 1722, 1690, 1664, 1649, 1633, 1601, 1654, 1646, 1621, 1600, 1565, 1583, 1578, 1575, 1592] },
  "Feb 25": { start: 1804, values: [1804, 1770, 1743, 1726, 1707, 1673, 1726, 1718, 1695, 1675, 1639, 1658, 1647, 1643, 1667] },
  "Mar 25": { start: 1834, values: [1834, 1801, 1779, 1755, 1718, 1771, 1761, 1735, 1714, 1677, 1697, 1685, 1679, 1701] },
  "Apr 25": { start: 1881, values: [1881, 1856, 1824, 1785, 1838, 1826, 1795, 1775, 1737, 1758, 1746, 1735, 1757] },
  "May 25": { start: 1934, values: [1934, 1897, 1856, 1906, 1894, 1861, 1841, 1798, 1820, 1809, 1799, 1822] },
  "Jun 25": { start: 1990, values: [1990, 1946, 1992, 1977, 1943, 1921, 1876, 1894, 1884, 1874, 1897] },
  "Jul 25": { start: 2042, values: [2042, 2081, 2061, 2024, 1997, 1950, 1967, 1958, 1947, 1965] },
  "Aug 25": { start: 2174, values: [2174, 2150, 2118, 2093, 2043, 2059, 2051, 2042, 2065] },
  "Sep 25": { start: 2243, values: [2243, 2210, 2174, 2118, 2132, 2126, 2121, 2143] },
  "Oct 25": { start: 2316, values: [2316, 2278, 2215, 2235, 2224, 2214, 2242] },
  "Nov 25": { start: 2370, values: [2370, 2299, 2310, 2296, 2286, 2312] },
  "Dec 25": { start: 2381, values: [2381, 2397, 2385, 2366, 2389] },
  "Jan 26": { start: 2495, values: [2495, 2475, 2449, 2469] },
  "Feb 26": { start: 2561, values: [2561, 2526, 2540] },
  "Mar 26": { start: 2618, values: [2618, 2633] },
  "Apr 26": { start: 2734, values: [2734] },
};

const REV_NRR_PCT = {
  "Dec 24": { start: 1709, values: [100, 98, 97, 95, 94, 93, 93, 91, 94, 93, 92, 91, 89, 90, 90, 90, 91] },
  "Jan 25": { start: 1734, values: [100, 99, 97, 96, 95, 94, 92, 95, 95, 93, 92, 90, 91, 91, 91, 92] },
  "Feb 25": { start: 1804, values: [100, 98, 97, 96, 95, 93, 96, 95, 94, 93, 91, 92, 91, 91, 92] },
  "Mar 25": { start: 1834, values: [100, 98, 97, 96, 94, 97, 96, 95, 93, 91, 93, 92, 92, 93] },
  "Apr 25": { start: 1881, values: [100, 99, 97, 95, 98, 97, 95, 94, 92, 93, 93, 92, 93] },
  "May 25": { start: 1934, values: [100, 98, 96, 99, 98, 96, 95, 93, 94, 94, 93, 94] },
  "Jun 25": { start: 1990, values: [100, 98, 100, 99, 98, 97, 94, 95, 95, 94, 95] },
  "Jul 25": { start: 2042, values: [100, 102, 101, 99, 98, 95, 96, 96, 95, 96] },
  "Aug 25": { start: 2174, values: [100, 99, 97, 96, 94, 95, 94, 94, 95] },
  "Sep 25": { start: 2243, values: [100, 99, 97, 94, 95, 95, 95, 96] },
  "Oct 25": { start: 2316, values: [100, 98, 96, 96, 96, 96, 97] },
  "Nov 25": { start: 2370, values: [100, 97, 97, 97, 96, 98] },
  "Dec 25": { start: 2381, values: [100, 101, 100, 99, 100] },
  "Jan 26": { start: 2495, values: [100, 99, 98, 99] },
  "Feb 26": { start: 2561, values: [100, 99, 99] },
  "Mar 26": { start: 2618, values: [100, 101] },
  "Apr 26": { start: 2734, values: [100] },
};

// ─────────────────── License Cohort Analysis ───────────────────

const LIC_LOGO_ABS = {
  "Dec 24": { start: 290, values: [290, 245, 205, 187, 174, 162, 156, 151, 141, 136, 133, 125, 104, 92, 88, 86, 81] },
  "Jan 25": { start: 404, values: [404, 339, 285, 258, 229, 218, 204, 200, 187, 179, 169, 164, 146, 141, 133, 126] },
  "Feb 25": { start: 358, values: [358, 307, 269, 238, 218, 202, 185, 173, 165, 156, 143, 138, 126, 125, 119] },
  "Mar 25": { start: 411, values: [411, 333, 296, 262, 238, 223, 208, 193, 183, 176, 168, 162, 154, 143] },
  "Apr 25": { start: 368, values: [368, 317, 282, 260, 240, 220, 199, 187, 176, 173, 170, 161, 145] },
  "May 25": { start: 409, values: [409, 332, 288, 266, 257, 242, 224, 213, 204, 198, 196, 193] },
  "Jun 25": { start: 435, values: [435, 376, 334, 301, 275, 263, 244, 235, 225, 216, 207] },
  "Jul 25": { start: 427, values: [427, 355, 321, 289, 257, 240, 223, 214, 204, 193] },
  "Aug 25": { start: 394, values: [394, 344, 310, 284, 260, 246, 229, 221, 212] },
  "Sep 25": { start: 373, values: [373, 315, 272, 249, 228, 208, 200, 193] },
  "Oct 25": { start: 409, values: [409, 351, 288, 260, 237, 222, 208] },
  "Nov 25": { start: 369, values: [369, 300, 260, 226, 205, 192] },
  "Dec 25": { start: 308, values: [309, 255, 218, 188, 174] },
  "Jan 26": { start: 405, values: [405, 322, 258, 224] },
  "Feb 26": { start: 367, values: [367, 309, 250] },
  "Mar 26": { start: 477, values: [477, 389] },
  "Apr 26": { start: 512, values: [512] },
};

const LIC_LOGO_PCT = {
  "Dec 24": { start: 290, values: [100, 84, 71, 64, 60, 56, 54, 52, 49, 47, 46, 43, 36, 32, 30, 30, 28] },
  "Jan 25": { start: 404, values: [100, 84, 71, 64, 57, 54, 50, 50, 46, 44, 42, 41, 36, 35, 33, 31] },
  "Feb 25": { start: 358, values: [100, 86, 75, 66, 61, 56, 52, 48, 46, 44, 40, 39, 35, 35, 33] },
  "Mar 25": { start: 411, values: [100, 81, 72, 64, 58, 54, 51, 47, 45, 43, 41, 39, 37, 35] },
  "Apr 25": { start: 368, values: [100, 86, 77, 71, 65, 60, 54, 51, 48, 47, 46, 44, 39] },
  "May 25": { start: 409, values: [100, 81, 70, 65, 63, 59, 55, 52, 50, 48, 48, 47] },
  "Jun 25": { start: 435, values: [100, 86, 77, 69, 63, 60, 56, 54, 52, 50, 48] },
  "Jul 25": { start: 427, values: [100, 83, 75, 68, 60, 56, 52, 50, 48, 45] },
  "Aug 25": { start: 394, values: [100, 87, 79, 72, 66, 62, 58, 56, 54] },
  "Sep 25": { start: 373, values: [100, 84, 73, 67, 61, 56, 54, 52] },
  "Oct 25": { start: 409, values: [100, 86, 70, 64, 58, 54, 51] },
  "Nov 25": { start: 369, values: [100, 81, 70, 61, 56, 52] },
  "Dec 25": { start: 308, values: [100, 83, 71, 61, 56] },
  "Jan 26": { start: 405, values: [100, 80, 64, 55] },
  "Feb 26": { start: 367, values: [100, 84, 68] },
  "Mar 26": { start: 477, values: [100, 82] },
  "Apr 26": { start: 512, values: [100] },
};

// License Net $ Retention — absolute, in $K. (Note Start = Land MRR; M0 = Land+Expansion at first month, may differ from Start for late cohorts.)
const LIC_NRR_ABS = {
  "Dec 24": { start: 52, values: [52, 60, 53, 51, 50, 51, 55, 56, 57, 54, 56, 49, 47, 47, 49, 49, 47] },
  "Jan 25": { start: 66, values: [66, 64, 59, 54, 52, 51, 48, 49, 49, 49, 48, 48, 47, 45, 43, 44] },
  "Feb 25": { start: 83, values: [83, 80, 80, 77, 73, 73, 72, 73, 74, 75, 74, 75, 69, 68, 74] },
  "Mar 25": { start: 64, values: [64, 58, 53, 49, 45, 44, 43, 40, 39, 39, 39, 38, 35, 34] },
  "Apr 25": { start: 80, values: [80, 77, 69, 67, 67, 64, 60, 61, 60, 61, 61, 57, 56] },
  "May 25": { start: 78, values: [78, 73, 71, 69, 69, 67, 67, 62, 62, 64, 65, 66] },
  "Jun 25": { start: 93, values: [93, 91, 87, 83, 82, 80, 78, 75, 76, 76, 75] },
  "Jul 25": { start: 95, values: [95, 88, 83, 80, 75, 73, 71, 73, 71, 67] },
  "Aug 25": { start: 92, values: [92, 89, 95, 97, 94, 92, 93, 95, 100] },
  "Sep 25": { start: 93, values: [93, 90, 80, 74, 73, 74, 78, 79] },
  "Oct 25": { start: 107, values: [107, 103, 97, 103, 98, 94, 98] },
  "Nov 25": { start: 92, values: [92, 83, 75, 73, 71, 70] },
  "Dec 25": { start: 82, values: [82, 89, 90, 82, 79] },
  "Jan 26": { start: 96, values: [96, 89, 81, 78] },
  "Feb 26": { start: 85, values: [85, 77, 71] },
  "Mar 26": { start: 93, values: [93, 95] },
  "Apr 26": { start: 99, values: [99] },
};

const LIC_NRR_PCT = {
  "Dec 24": { start: 52, values: [100, 115, 101, 98, 95, 97, 104, 107, 109, 103, 106, 94, 90, 90, 93, 93, 89] },
  "Jan 25": { start: 66, values: [100, 97, 89, 81, 79, 76, 73, 74, 75, 74, 73, 72, 71, 67, 65, 67] },
  "Feb 25": { start: 83, values: [100, 96, 96, 93, 89, 88, 88, 88, 90, 91, 89, 91, 83, 83, 90] },
  "Mar 25": { start: 64, values: [100, 90, 83, 76, 70, 69, 67, 62, 61, 60, 61, 60, 55, 53] },
  "Apr 25": { start: 80, values: [100, 96, 86, 83, 83, 80, 75, 76, 75, 76, 76, 71, 70] },
  "May 25": { start: 78, values: [100, 94, 92, 89, 89, 86, 85, 80, 80, 83, 83, 85] },
  "Jun 25": { start: 93, values: [100, 99, 94, 90, 88, 87, 84, 81, 82, 82, 82] },
  "Jul 25": { start: 95, values: [100, 93, 88, 85, 79, 77, 75, 77, 75, 71] },
  "Aug 25": { start: 92, values: [100, 96, 103, 105, 102, 100, 101, 103, 108] },
  "Sep 25": { start: 93, values: [100, 97, 87, 80, 79, 80, 84, 85] },
  "Oct 25": { start: 107, values: [100, 97, 91, 96, 92, 88, 92] },
  "Nov 25": { start: 92, values: [100, 91, 82, 79, 78, 76] },
  "Dec 25": { start: 82, values: [100, 108, 109, 99, 95] },
  "Jan 26": { start: 96, values: [100, 92, 84, 82] },
  "Feb 26": { start: 85, values: [100, 91, 83] },
  "Mar 26": { start: 93, values: [100, 102] },
  "Apr 26": { start: 99, values: [100] },
};

// Number of M-columns needed = max row length across all matrices.
function maxCols(table) {
  return Math.max(...Object.values(table).map((r) => r.values.length));
}

function buildMatrix(title, table) {
  const cols = maxCols(table);
  return {
    title,
    monthHeaders: Array.from({ length: cols }, (_, i) => `M${i}`),
    rows: COHORTS.map((cohort) => {
      const row = table[cohort];
      if (!row) return { cohort, start: null, values: [] };
      return {
        cohort,
        start: row.start,
        values: row.values,
      };
    }),
  };
}

// ─────────────────── Trend line points ───────────────────

function pct(n, d) {
  return Math.round((n / d) * 10000) / 100;
}

// Tab 1: 12-month NRR (existing customers) — Revenue Net $ Retention M12 ÷ M0.
const existing12mTrend = COHORTS
  .filter((c) => REV_NRR_ABS[c]?.values.length > 12)
  .map((c) => {
    const v = REV_NRR_ABS[c].values;
    return {
      cohort: c,
      pct: pct(v[12], v[0]),
      numerator: v[12] * 1000,
      denominator: v[0] * 1000,
    };
  });

// Tab 2: 3-month NRR + Logo Retention — License M3 ÷ M0, cohorts after Apr 25.
const cohortsAfterApr25 = COHORTS.slice(COHORTS.indexOf("May 25"));
const threeMonthNrr = cohortsAfterApr25
  .filter((c) => LIC_NRR_ABS[c]?.values.length > 3)
  .map((c) => {
    const v = LIC_NRR_ABS[c].values;
    return { cohort: c, pct: pct(v[3], v[0]), numerator: v[3] * 1000, denominator: v[0] * 1000 };
  });
const threeMonthLogo = cohortsAfterApr25
  .filter((c) => LIC_LOGO_ABS[c]?.values.length > 3)
  .map((c) => {
    const v = LIC_LOGO_ABS[c].values;
    return { cohort: c, pct: pct(v[3], v[0]), numerator: v[3], denominator: v[0] };
  });

// Tab 3: 12-month NRR (new customers) — License Net $ Retention M12 ÷ M0.
const newCustomers12mTrend = COHORTS
  .filter((c) => LIC_NRR_ABS[c]?.values.length > 12)
  .map((c) => {
    const v = LIC_NRR_ABS[c].values;
    return { cohort: c, pct: pct(v[12], v[0]), numerator: v[12] * 1000, denominator: v[0] * 1000 };
  });

const data = {
  existing12m: {
    title: "12-Month NRR — Existing Customers",
    subtitle: "Net $ Retention at M12 ÷ M0 per cohort. Source: Revenue Cohort Analysis. As of May 2026, cohorts Dec 24 → Apr 25 have a full 12-month window.",
    trend: existing12mTrend,
    nrrAbsolute: buildMatrix("Revenue Net $ Retention — Absolute ($K)", REV_NRR_ABS),
    nrrPercent: buildMatrix("Revenue Net $ Retention — %", REV_NRR_PCT),
  },
  threeMonth: {
    title: "3-Month NRR & Logo Retention — New Cohorts",
    subtitle: "M3 ÷ M0 per cohort. Source: License Cohort Analysis. Cohorts from May 25 onwards; current date May 2026.",
    nrrTrend: threeMonthNrr,
    logoTrend: threeMonthLogo,
    logoAbsolute: buildMatrix("License Logo Retention — Absolute (count)", LIC_LOGO_ABS),
    logoPercent: buildMatrix("License Logo Retention — %", LIC_LOGO_PCT),
    nrrAbsolute: buildMatrix("License Net $ Retention — Absolute ($K)", LIC_NRR_ABS),
    nrrPercent: buildMatrix("License Net $ Retention — %", LIC_NRR_PCT),
  },
  newCustomers12m: {
    title: "12-Month NRR — New Customers",
    subtitle: "Net $ Retention at M12 ÷ M0 per License cohort. Source: License Cohort Analysis. Cohorts Dec 24 → Apr 25 have a full 12-month window.",
    trend: newCustomers12mTrend,
    nrrAbsolute: buildMatrix("License Net $ Retention — Absolute ($K)", LIC_NRR_ABS),
    nrrPercent: buildMatrix("License Net $ Retention — %", LIC_NRR_PCT),
  },
};

writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(`wrote ${OUT} (${JSON.stringify(data).length} bytes)`);
