// Re-extracts QBR data from a local copy of HubSpot deal records.
// Reads /tmp/qbr-raw/all_deals.json (1074 deals fetched via MCP), processes locally,
// writes the 8 Sales JSON files into ./data/sales/.
//
// Usage: `node scripts/process-local.mjs (or directly: node sections/sales/process.mjs)`

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "data", "sales");
const RAW = "/tmp/qbr-raw/all_deals.json";
const SUBSCRIPTION_TYPE_MAP = "/tmp/qbr-raw/subscription_type_map.json";

// Subscription type per deal (fetched separately because raw all_deals.json
// doesn't include the subscription_type HubSpot property).
const SUB_TYPE = fs.existsSync(SUBSCRIPTION_TYPE_MAP)
  ? JSON.parse(fs.readFileSync(SUBSCRIPTION_TYPE_MAP, "utf8"))
  : {};

const Q_START = "2026-02-01";
const Q_END   = "2026-04-30";
const FILE_SUFFIX = "q1-fy2026"; // file naming preserved; UI displays "FY2027"

// HubSpot stage UUIDs
const STAGE_CLOSEDWON  = "d313c0ab-48c8-4d8f-bf40-a17eb7e7c40b";
const STAGE_CLOSEDLOST = "cc768ce0-2d18-48ff-85c6-7ec31dcc231f";

const NEW_BIZ_TYPES = new Set(["Land", "Expand Horizontal", "Expand Vertical"]);

// AE roster: id -> { name, region, isActive }
// Regions taken from existing data files; names from those files; xlsx confirms active status
// and provides names/regions for previously-Unknown owners.
const AE_ROSTER = {
  "80591062":   { name: "Abhijeet Srivastava", region: "APAC",  isActive: true },
  "191671239":  { name: "Rishabh Bhushan",     region: "EMEA",  isActive: true },
  "2136092292": { name: "Manmeet Saluja",      region: "NAMER", isActive: true },
  "1647719282": { name: "Rory Costello",       region: "NAMER", isActive: true },
  "162335834":  { name: "Ankit Shukla",        region: "EMEA",  isActive: true },
  "491798563":  { name: "Rohit Lakhanpal",     region: "NAMER", isActive: true },
  "714622523":  { name: "Rohan Verma",         region: "NAMER", isActive: true },
  "491086913":  { name: "Erin Dean",           region: "NAMER", isActive: true },
  "95970067":   { name: "Yash Chandra",        region: "NAMER", isActive: true },
  "227811766":  { name: "Sneha Agarwal",       region: "EMEA",  isActive: true },
  "186570908":  { name: "Swapnil Dwivedi",     region: "NAMER", isActive: true },
  // Inactive / non-AE owners that appear in deals — used for naming only
  "1009927245": { name: "Joel Philip",         region: "Unknown", isActive: false },
  "322464634":  { name: "Rishi Agarwal",       region: "Unknown", isActive: false },
  "80946983":   { name: "Psrea Singh",        region: "Unknown", isActive: false },
  "542398241":  { name: "Narayan RL",          region: "Unknown", isActive: false },
  "80947097":   { name: "Suyash Yadav",        region: "Unknown", isActive: false },
  "235569089":  { name: "Jeffry Infant",       region: "Unknown", isActive: false },
  "634693314":  { name: "Megha Patil",         region: "Unknown", isActive: false },
  "1261252981": { name: "Anthony Brown",       region: "Unknown", isActive: false },
  "96825892":   { name: "Katie Thompson",      region: "Unknown", isActive: false },
  "1463621460": { name: "Sumit Singh",         region: "Unknown", isActive: false },
  "1566222292": { name: "Anand Bhagat",        region: "Unknown", isActive: false },
  "1078138479": { name: "Aditya Raj",          region: "Unknown", isActive: false },
  "81219550":   { name: "Gajendra Singh",      region: "Unknown", isActive: false },
  "80258263":   { name: "Vedant Bhatia",       region: "Unknown", isActive: false },
  "2004790025": { name: "Anmol Multani",       region: "Unknown", isActive: false },
  "81122772":   { name: "Aashna Arora",        region: "Unknown", isActive: false },
  "24198523":   { name: "Akhil Ambati",        region: "Unknown", isActive: false },
  "66211660":   { name: "Jordan Verity",       region: "Unknown", isActive: false },
  "317226540":  { name: "Arshaq Ahmed Ali",    region: "Unknown", isActive: false },
  "160141687":  { name: "Mohit Singhal",       region: "Unknown", isActive: false },
  "265183267":  { name: "Manpreet Singh",      region: "Unknown", isActive: false },
  "163106863":  { name: "Rishya Jana",         region: "Unknown", isActive: false },
  "1391784932": { name: "Yash Dharwala",       region: "Unknown", isActive: false },
  "952001830":  { name: "Royston Fritchley",   region: "Unknown", isActive: false },
};

// SDR/BDR roster (from previous data file owner lookups)
const REP_ROSTER = {
  "80947097":   "Suyash Yadav",
  "322464634":  "Rishi Agarwal",
  "81219550":   "Gajendra Singh",
  "1566222292": "Anand Bhagat",
  "2004790025": "Anmol Multani",
  "80946983":   "Psrea Singh",
  "163106863":  "Rishya Jana",
  "1391784932": "Yash Dharwala",
  "952001830":  "Royston Fritchley",
  "1078138479": "Aditya Raj",
  "1009927245": "Joel Philip",
  "1463621460": "Sumit Singh",
};

// Active AE quotas (Q1 FY27 = Feb+Mar+Apr 2026 monthly MRR sum, ACV = MRR*12)
const AE_QUOTAS = {
  "80591062":   { mrrQuota: 15600, acvQuota: 187200 },
  "191671239":  { mrrQuota: 10400, acvQuota: 124800 },
  "2136092292": { mrrQuota: 15600, acvQuota: 187200 },
  "1647719282": { mrrQuota: 21000, acvQuota: 252000 },
  "162335834":  { mrrQuota: 5200,  acvQuota: 62400  },
  "491798563":  { mrrQuota: 17400, acvQuota: 208800 },
  "714622523":  { mrrQuota: 15600, acvQuota: 187200 },
  "491086913":  { mrrQuota: 19800, acvQuota: 237600 },
  "95970067":   { mrrQuota: 17400, acvQuota: 208800 },
  "227811766":  { mrrQuota: 17400, acvQuota: 208800 },
  "186570908":  { mrrQuota: 15600, acvQuota: 187200 },
};

// -------- helpers --------
function inDateRange(iso) {
  if (!iso) return false;
  const day = iso.slice(0, 10);
  return day >= Q_START && day <= Q_END;
}
function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function round(n, d = 2) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}
function dealTypeKey(raw) {
  const v = (raw || "").toLowerCase().trim();
  if (v === "land") return "land";
  if (v === "expand horizontal" || v === "expand h") return "expandH";
  if (v === "expand vertical" || v === "expand v") return "expandV";
  return null;
}
function getAE(d) {
  const id = d.properties.hubspot_owner_id || "";
  if (!id) return { id: "", name: "Unknown", region: "Unknown", isActive: false };
  const r = AE_ROSTER[id];
  if (r) return { id, name: r.name, region: r.region, isActive: r.isActive };
  return { id, name: `Unknown (${id})`, region: "Unknown", isActive: false };
}
function isBigBiz(props) {
  const raw = props.business_size___discovered;
  if (!raw) return false;
  const n = parseFloat(raw);
  return !isNaN(n) && n >= 100;
}
function emptyDT() {
  return { land: { deals: 0, mrr: 0 }, expandH: { deals: 0, mrr: 0 }, expandV: { deals: 0, mrr: 0 } };
}
function addDT(agg, props, mrr) {
  const k = dealTypeKey(props.dealtype);
  if (k) { agg[k].deals += 1; agg[k].mrr += mrr; }
}
function fmtSplit(r) {
  return {
    land:    { deals: r.land.deals,    mrr: round(r.land.mrr) },
    expandH: { deals: r.expandH.deals, mrr: round(r.expandH.mrr) },
    expandV: { deals: r.expandV.deals, mrr: round(r.expandV.mrr) },
  };
}

// -------- main --------
const deals = JSON.parse(fs.readFileSync(RAW, "utf8"));
console.log(`Loaded ${deals.length} deals`);

// Filter NB
const nbDeals = deals.filter((d) => NEW_BIZ_TYPES.has(d.properties.dealtype));
console.log(`NB deals: ${nbDeals.length}`);

// ============================================================
// 1) S2 Pipeline (oqd in period, NB)
// ============================================================
{
  const s2 = nbDeals.filter((d) => inDateRange(d.properties.opportunity_qualified_date));
  let totalMRR = 0;
  const totalDT = emptyDT();
  const regionMap = new Map();
  const roleMap = new Map();
  const repMap = new Map();
  const sourceMap = new Map();

  for (const d of s2) {
    const p = d.properties;
    const mrr = parseFloat(p.amount ?? "0") || 0;
    totalMRR += mrr; addDT(totalDT, p, mrr);

    const ae = getAE(d);
    let r = regionMap.get(ae.region);
    if (!r) { r = { deals: 0, mrr: 0, ...emptyDT() }; regionMap.set(ae.region, r); }
    r.deals++; r.mrr += mrr; addDT(r, p, mrr);

    const rawRole = (p.sdr_bdr_ps_owner_role || "").toUpperCase().trim();
    let role = "AE";
    if (rawRole === "SDRS" || rawRole === "SDR") role = "SDR";
    else if (rawRole === "BDRS" || rawRole === "BDR") role = "BDR";
    else if (rawRole === "SALES ASSISTED" || rawRole === "PS") role = "PS";
    let rl = roleMap.get(role);
    if (!rl) { rl = { deals: 0, mrr: 0, ...emptyDT() }; roleMap.set(role, rl); }
    rl.deals++; rl.mrr += mrr; addDT(rl, p, mrr);

    if ((role === "SDR" || role === "BDR") && p.sdr_bdr_ps_owner) {
      const repId = p.sdr_bdr_ps_owner;
      const repName = REP_ROSTER[repId] || `Owner ${repId}`;
      let rep = repMap.get(repId);
      if (!rep) { rep = { ownerId: repId, name: repName, role, deals: 0, mrr: 0, ...emptyDT() }; repMap.set(repId, rep); }
      rep.deals++; rep.mrr += mrr; addDT(rep, p, mrr);
    }

    const src = p.opp_source___l1 || "Unknown";
    let s = sourceMap.get(src);
    if (!s) { s = { deals: 0, mrr: 0, ...emptyDT() }; sourceMap.set(src, s); }
    s.deals++; s.mrr += mrr; addDT(s, p, mrr);
  }

  const ROLE_ORDER = ["SDR", "BDR", "PS", "AE"];
  const out = {
    totalDeals: s2.length,
    totalMRR: round(totalMRR),
    avgDealSize: s2.length ? round(totalMRR / s2.length) : 0,
    byDealType: fmtSplit(totalDT),
    byRegion: [...regionMap.entries()].map(([region, v]) => ({ region, deals: v.deals, mrr: round(v.mrr), ...fmtSplit(v) })).sort((a, b) => b.mrr - a.mrr),
    byRole: ROLE_ORDER.map((role) => {
      const r = roleMap.get(role) ?? { deals: 0, mrr: 0, ...emptyDT() };
      return { role, deals: r.deals, mrr: round(r.mrr), ...fmtSplit(r) };
    }),
    bySdrBdr: [...repMap.values()].map((r) => ({ ownerId: r.ownerId, name: r.name, role: r.role, deals: r.deals, mrr: round(r.mrr), ...fmtSplit(r) })).sort((a, b) => b.mrr - a.mrr),
    byOppSource: [...sourceMap.entries()].map(([source, v]) => ({ source, deals: v.deals, mrr: round(v.mrr), ...fmtSplit(v) })).sort((a, b) => b.mrr - a.mrr),
  };
  fs.writeFileSync(path.join(DATA_DIR, `s2-pipeline-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  console.log(`S2 Pipeline: ${s2.length} deals, MRR $${round(totalMRR)}`);
}

// ============================================================
// 2) S1 → S2% (createdate cohort, with deal type splits)
// ============================================================
{
  const s1Deals = nbDeals.filter((d) => inDateRange(d.properties.createdate));
  let totalS1 = 0, totalS2 = 0, totalS1Mrr = 0, totalS2Mrr = 0;
  const totalS1DT = emptyDT(), totalS2DT = emptyDT();
  const aeMap = new Map();
  const sdrMap = new Map();

  for (const d of s1Deals) {
    const p = d.properties;
    const mrr = parseFloat(p.amount ?? "0") || 0;
    const isS2 = !!p.opportunity_qualified_date;
    totalS1++; totalS1Mrr += mrr; addDT(totalS1DT, p, mrr);
    if (isS2) { totalS2++; totalS2Mrr += mrr; addDT(totalS2DT, p, mrr); }

    const ae = getAE(d);
    const key = ae.id || "";
    let r = aeMap.get(key);
    if (!r) { r = { ownerId: ae.id, name: ae.name, s1Deals: 0, s2Deals: 0, s1Mrr: 0, s2Mrr: 0, s1: emptyDT(), s2: emptyDT() }; aeMap.set(key, r); }
    r.s1Deals++; r.s1Mrr += mrr; addDT(r.s1, p, mrr);
    if (isS2) { r.s2Deals++; r.s2Mrr += mrr; addDT(r.s2, p, mrr); }

    const rawRole = (p.sdr_bdr_ps_owner_role || "").toUpperCase().trim();
    let role = null;
    if (rawRole === "SDRS" || rawRole === "SDR") role = "SDR";
    else if (rawRole === "BDRS" || rawRole === "BDR") role = "BDR";
    const repId = p.sdr_bdr_ps_owner;
    if (role && repId) {
      const repName = REP_ROSTER[repId] || `Owner ${repId}`;
      let rep = sdrMap.get(repId);
      if (!rep) { rep = { ownerId: repId, name: repName, role, s1Deals: 0, s2Deals: 0, s1Mrr: 0, s2Mrr: 0, s1: emptyDT(), s2: emptyDT() }; sdrMap.set(repId, rep); }
      rep.s1Deals++; rep.s1Mrr += mrr; addDT(rep.s1, p, mrr);
      if (isS2) { rep.s2Deals++; rep.s2Mrr += mrr; addDT(rep.s2, p, mrr); }
    }
  }

  function shapeRow(r) {
    return {
      ownerId: r.ownerId, name: r.name, ...(r.role ? { role: r.role } : {}),
      s1Deals: r.s1Deals, s2Deals: r.s2Deals,
      s1Mrr: round(r.s1Mrr), s2Mrr: round(r.s2Mrr),
      conversionPct: r.s1Deals ? round((r.s2Deals / r.s1Deals) * 100, 1) : 0,
      s1: fmtSplit(r.s1), s2: fmtSplit(r.s2),
    };
  }

  const out = {
    totalS1Deals: totalS1, totalS2Deals: totalS2,
    totalS1Mrr: round(totalS1Mrr), totalS2Mrr: round(totalS2Mrr),
    conversionPct: totalS1 ? round((totalS2 / totalS1) * 100, 1) : 0,
    s1ByDealType: fmtSplit(totalS1DT),
    s2ByDealType: fmtSplit(totalS2DT),
    byAE: [...aeMap.values()].sort((a, b) => b.s1Deals - a.s1Deals).map(shapeRow),
    bySdr: [...sdrMap.values()].sort((a, b) => b.s1Deals - a.s1Deals).map(shapeRow),
  };
  fs.writeFileSync(path.join(DATA_DIR, `s1-s2-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  console.log(`S1->S2: ${totalS1} -> ${totalS2}`);
}

// ============================================================
// 3) Win Rate (S2 cohort + Close Date cohort, with byAE for each)
// ============================================================
{
  const isWon  = (d) => d.properties.dealstage === STAGE_CLOSEDWON;
  const isLost = (d) => d.properties.dealstage === STAGE_CLOSEDLOST;

  // includeOpenInDenominator=true (S2 cohort): WR = won / total cohort (incl. open).
  // false (close-date cohort): WR = won / (won + lost).
  function buildCohort(cohort, includeOpenInDenominator) {
    const mk = () => ({ won: 0, lost: 0, open: 0, wonMrr: 0, lostMrr: 0, wonDT: emptyDT(), lostDT: emptyDT() });
    const overall = mk(), plus = mk(), minus = mk();
    for (const d of cohort) {
      const p = d.properties;
      const won = isWon(d), lost = isLost(d);
      const mrr = parseFloat(p.amount ?? "0") || 0;
      const big = isBigBiz(p);
      const buckets = [overall, big ? plus : minus];
      for (const b of buckets) {
        if (won)      { b.won++; b.wonMrr += mrr; addDT(b.wonDT, p, mrr); }
        else if (lost){ b.lost++; b.lostMrr += mrr; addDT(b.lostDT, p, mrr); }
        else          { b.open++; }
      }
    }
    const shape = (b) => {
      const denom = includeOpenInDenominator ? (b.won + b.lost + b.open) : (b.won + b.lost);
      return {
        won: b.won, lost: b.lost, open: b.open,
        total: includeOpenInDenominator ? (b.won + b.lost + b.open) : (b.won + b.lost),
        winRate: denom ? round((b.won / denom) * 100, 1) : 0,
        wonMrr: round(b.wonMrr), lostMrr: round(b.lostMrr),
        wonByDealType: fmtSplit(b.wonDT), lostByDealType: fmtSplit(b.lostDT),
      };
    };
    return { overall: shape(overall), "100plus": shape(plus), "100minus": shape(minus) };
  }

  function buildByAE(cohort, includeOpenInDenominator) {
    const m = new Map();
    for (const d of cohort) {
      const p = d.properties;
      const won = isWon(d), lost = isLost(d);
      const ae = getAE(d);
      const key = ae.id || "";
      let r = m.get(key);
      if (!r) { r = { ownerId: ae.id, name: ae.name, region: ae.region, won: 0, lost: 0, open: 0, wonMrr: 0, lostMrr: 0, wonDT: emptyDT(), lostDT: emptyDT() }; m.set(key, r); }
      const mrr = parseFloat(p.amount ?? "0") || 0;
      if (won)      { r.won++; r.wonMrr += mrr; addDT(r.wonDT, p, mrr); }
      else if (lost){ r.lost++; r.lostMrr += mrr; addDT(r.lostDT, p, mrr); }
      else          { r.open++; }
    }
    return [...m.values()].map((r) => {
      const denom = includeOpenInDenominator ? (r.won + r.lost + r.open) : (r.won + r.lost);
      return {
        ownerId: r.ownerId, name: r.name, region: r.region,
        won: r.won, lost: r.lost, open: r.open,
        total: includeOpenInDenominator ? (r.won + r.lost + r.open) : (r.won + r.lost),
        winRate: denom ? round((r.won / denom) * 100, 1) : 0,
        wonMrr: round(r.wonMrr), lostMrr: round(r.lostMrr),
        wonByDealType: fmtSplit(r.wonDT), lostByDealType: fmtSplit(r.lostDT),
      };
    }).sort((a, b) => b.total - a.total);
  }

  // Per-AE S1->S2 (createdate cohort) — used to enrich byAE_s2 with s1 baseline
  const s1ByAE = new Map();
  for (const d of nbDeals) {
    if (!inDateRange(d.properties.createdate)) continue;
    const ae = getAE(d);
    const key = ae.id || "";
    if (!s1ByAE.has(key)) s1ByAE.set(key, { s1Deals: 0, s2Deals: 0 });
    const x = s1ByAE.get(key);
    x.s1Deals++;
    if (d.properties.opportunity_qualified_date) x.s2Deals++;
  }

  const s2Cohort = nbDeals.filter((d) => inDateRange(d.properties.opportunity_qualified_date));
  // Close-date cohort additionally requires opportunity_qualified_date to be set.
  const cdCohort = nbDeals.filter(
    (d) => inDateRange(d.properties.closedate) && !!d.properties.opportunity_qualified_date,
  );

  const byAE_s2 = buildByAE(s2Cohort, true).map((row) => {
    const s1 = s1ByAE.get(row.ownerId || "") ?? { s1Deals: 0, s2Deals: 0 };
    return {
      ...row,
      s1Deals: s1.s1Deals,
      s1ToS2Pct: s1.s1Deals ? round((s1.s2Deals / s1.s1Deals) * 100, 1) : 0,
    };
  });

  const out = {
    byCohort: {
      s2: buildCohort(s2Cohort, true),
      closeDate: buildCohort(cdCohort, false),
    },
    byAE_s2,
    byAE_closeDate: buildByAE(cdCohort, false),
  };
  fs.writeFileSync(path.join(DATA_DIR, `win-rate-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  console.log(`Win Rate: S2 cohort=${s2Cohort.length}, CD cohort=${cdCohort.length}`);
}

// ============================================================
// 4) Bookings (closedate in period AND closedwon)
// ============================================================
{
  const won = nbDeals.filter((d) =>
    inDateRange(d.properties.closedate) && d.properties.dealstage === STAGE_CLOSEDWON);
  let totalDeals = 0, totalMRR = 0;
  const regionMap = new Map();
  const aeMap = new Map();
  const sourceMap = new Map();
  const subTypeMap = new Map();

  for (const d of won) {
    const p = d.properties;
    const mrr = parseFloat(p.amount ?? "0") || 0;
    totalDeals++; totalMRR += mrr;

    const ae = getAE(d);
    let r = regionMap.get(ae.region);
    if (!r) { r = { region: ae.region, deals: 0, mrr: 0, ...emptyDT() }; regionMap.set(ae.region, r); }
    r.deals++; r.mrr += mrr; addDT(r, p, mrr);

    const aeKey = ae.id || "";
    let a = aeMap.get(aeKey);
    if (!a) { a = { ownerId: ae.id, name: ae.name, region: ae.region, isActive: ae.isActive, deals: 0, mrr: 0, ...emptyDT() }; aeMap.set(aeKey, a); }
    a.deals++; a.mrr += mrr; addDT(a, p, mrr);

    const src = p.opp_source___l1 || "Unknown";
    let s = sourceMap.get(src);
    if (!s) { s = { source: src, deals: 0, mrr: 0, ...emptyDT() }; sourceMap.set(src, s); }
    s.deals++; s.mrr += mrr; addDT(s, p, mrr);

    // Use HubSpot subscription_type property (loaded from SUBSCRIPTION_TYPE_MAP).
    // Fall back to "Unknown" so we can spot coverage gaps.
    const st = SUB_TYPE[d.id] || SUB_TYPE[String(d.id)] || "Unknown";
    let sub = subTypeMap.get(st);
    if (!sub) { sub = { type: st, deals: 0, mrr: 0 }; subTypeMap.set(st, sub); }
    sub.deals++; sub.mrr += mrr;
  }

  const totalSubMRR = [...subTypeMap.values()].reduce((s, r) => s + r.mrr, 0);

  // Merge active AE quotas into byAE rows (include all active even if 0 deals)
  const allAEMap = new Map(aeMap);
  for (const id of Object.keys(AE_QUOTAS)) {
    if (!allAEMap.has(id)) {
      const r = AE_ROSTER[id];
      allAEMap.set(id, { ownerId: id, name: r.name, region: r.region, isActive: true, deals: 0, mrr: 0, ...emptyDT() });
    }
  }

  const byAE = [...allAEMap.values()].map((r) => {
    const q = AE_QUOTAS[r.ownerId];
    return {
      ownerId: r.ownerId, name: r.name, region: r.region, isActive: !!r.isActive,
      deals: r.deals, mrr: round(r.mrr),
      mrrQuota: q?.mrrQuota ?? 0,
      mrrQuotaPct: q?.mrrQuota ? round((r.mrr / q.mrrQuota) * 100, 1) : 0,
      acvQuota: q?.acvQuota ?? 0,
      acvQuotaPct: q?.acvQuota ? round(((r.mrr * 12) / q.acvQuota) * 100, 1) : 0,
      ...fmtSplit(r),
    };
  }).sort((a, b) => b.mrr - a.mrr);

  // Quota totals (sum across active AEs)
  const totalMrrQuota = Object.values(AE_QUOTAS).reduce((s, q) => s + q.mrrQuota, 0);
  const totalAcvQuota = Object.values(AE_QUOTAS).reduce((s, q) => s + q.acvQuota, 0);

  const out = {
    totalDeals, totalMRR: round(totalMRR),
    totalACV: round(totalMRR * 12),
    avgDealSize: totalDeals ? round(totalMRR / totalDeals) : 0,
    totalMrrQuota,
    totalMrrQuotaPct: totalMrrQuota ? round((totalMRR / totalMrrQuota) * 100, 1) : 0,
    totalAcvQuota,
    totalAcvQuotaPct: totalAcvQuota ? round(((totalMRR * 12) / totalAcvQuota) * 100, 1) : 0,
    byRegion: [...regionMap.values()].map((r) => ({ region: r.region, deals: r.deals, mrr: round(r.mrr), ...fmtSplit(r) })).sort((a, b) => b.mrr - a.mrr),
    byAE,
    bySource: [...sourceMap.values()].map((r) => ({ source: r.source, deals: r.deals, mrr: round(r.mrr), ...fmtSplit(r) })).sort((a, b) => b.mrr - a.mrr),
    bySubType: [...subTypeMap.values()].map((r) => ({ type: r.type, deals: r.deals, mrr: round(r.mrr), pct: totalSubMRR ? round((r.mrr / totalSubMRR) * 100, 1) : 0 })).sort((a, b) => b.mrr - a.mrr),
  };
  fs.writeFileSync(path.join(DATA_DIR, `bookings-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  console.log(`Bookings: ${totalDeals} won, MRR $${round(totalMRR)}`);
}

// ============================================================
// 5) ACV (closedwon, with 100+/100- splits)
// ============================================================
{
  const won = nbDeals.filter((d) =>
    inDateRange(d.properties.closedate) && d.properties.dealstage === STAGE_CLOSEDWON);
  function emptyACV() { return { deals: 0, totalMRR: 0 }; }
  function shapeACV(b) {
    const totalACV = b.totalMRR * 12;
    return { deals: b.deals, totalMRR: round(b.totalMRR), totalACV: round(totalACV), avgACV: b.deals ? round(totalACV / b.deals) : 0 };
  }
  const overall = emptyACV(), plus = emptyACV(), minus = emptyACV();
  const aeMap = new Map(), regionMap = new Map();

  for (const d of won) {
    const p = d.properties;
    const mrr = parseFloat(p.amount ?? "0") || 0;
    const big = isBigBiz(p);
    overall.deals++; overall.totalMRR += mrr;
    const sub = big ? plus : minus; sub.deals++; sub.totalMRR += mrr;

    const ae = getAE(d);
    const aeKey = ae.id || "";
    let a = aeMap.get(aeKey);
    if (!a) { a = { ownerId: ae.id, name: ae.name, region: ae.region, overall: emptyACV(), "100plus": emptyACV(), "100minus": emptyACV() }; aeMap.set(aeKey, a); }
    a.overall.deals++; a.overall.totalMRR += mrr;
    const sa = big ? a["100plus"] : a["100minus"]; sa.deals++; sa.totalMRR += mrr;

    let r = regionMap.get(ae.region);
    if (!r) { r = { region: ae.region, overall: emptyACV(), "100plus": emptyACV(), "100minus": emptyACV() }; regionMap.set(ae.region, r); }
    r.overall.deals++; r.overall.totalMRR += mrr;
    const sr = big ? r["100plus"] : r["100minus"]; sr.deals++; sr.totalMRR += mrr;
  }

  const out = {
    overall: shapeACV(overall), "100plus": shapeACV(plus), "100minus": shapeACV(minus),
    byAE: [...aeMap.values()].map((a) => ({ ownerId: a.ownerId, name: a.name, region: a.region, overall: shapeACV(a.overall), "100plus": shapeACV(a["100plus"]), "100minus": shapeACV(a["100minus"]) })).sort((a, b) => b.overall.totalMRR - a.overall.totalMRR),
    byRegion: [...regionMap.values()].map((r) => ({ region: r.region, overall: shapeACV(r.overall), "100plus": shapeACV(r["100plus"]), "100minus": shapeACV(r["100minus"]) })).sort((a, b) => b.overall.totalMRR - a.overall.totalMRR),
  };
  fs.writeFileSync(path.join(DATA_DIR, `acv-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  console.log(`ACV: ${won.length} deals`);
}

// ============================================================
// 6) Sales Cycle (closedate − createdate, won deals)
// ============================================================
{
  const won = nbDeals.filter((d) =>
    inDateRange(d.properties.closedate) && d.properties.dealstage === STAGE_CLOSEDWON);
  function days(d) {
    const cd = d.properties.closedate, cr = d.properties.createdate;
    if (!cd || !cr) return null;
    const ms = new Date(cd).getTime() - new Date(cr).getTime();
    return Math.max(0, Math.round(ms / 86400000));
  }
  function statify(arr) {
    if (!arr.length) return { deals: 0, avgDays: 0, medianDays: 0, minDays: 0, maxDays: 0 };
    const avg = arr.reduce((s, n) => s + n, 0) / arr.length;
    return {
      deals: arr.length,
      avgDays: Math.round(avg),
      medianDays: Math.round(median(arr)),
      minDays: Math.min(...arr),
      maxDays: Math.max(...arr),
    };
  }
  const all = []; const aeMap = new Map(); const regionMap = new Map();
  for (const d of won) {
    const dy = days(d); if (dy == null) continue;
    all.push(dy);
    const ae = getAE(d);
    const aeKey = ae.id || "";
    let a = aeMap.get(aeKey); if (!a) { a = { ownerId: ae.id, name: ae.name, region: ae.region, days: [] }; aeMap.set(aeKey, a); }
    a.days.push(dy);
    let r = regionMap.get(ae.region); if (!r) { r = { region: ae.region, days: [] }; regionMap.set(ae.region, r); }
    r.days.push(dy);
  }
  const out = {
    overall: statify(all),
    byAE: [...aeMap.values()].map((a) => ({ ownerId: a.ownerId, name: a.name, region: a.region, ...statify(a.days) })).sort((a, b) => b.deals - a.deals),
    byRegion: [...regionMap.values()].map((r) => ({ region: r.region, ...statify(r.days) })).sort((a, b) => b.deals - a.deals),
  };
  fs.writeFileSync(path.join(DATA_DIR, `sales-cycle-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  console.log(`Sales Cycle: ${all.length} deals`);
}

// ============================================================
// 7+8) Reasons (Win uses secondary_win_reasons; Loss uses loss_reason__c)
// ============================================================
function buildReasons(filterFn, propKey, outName) {
  const matchedDeals = nbDeals.filter(filterFn);
  const byReasonOverall = new Map();
  const byAEMap = new Map();
  let totalDeals = 0, totalMRR = 0;

  for (const d of matchedDeals) {
    const p = d.properties;
    const mrr = parseFloat(p.amount ?? "0") || 0;
    totalDeals++; totalMRR += mrr;
    const raw = p[propKey] ?? "";
    const reasons = String(raw).split(";").map((s) => s.trim()).filter(Boolean);
    if (!reasons.length) reasons.push("(No reason)");
    for (const reason of reasons) {
      let r = byReasonOverall.get(reason);
      if (!r) { r = { reason, deals: 0, mrr: 0 }; byReasonOverall.set(reason, r); }
      r.deals++; r.mrr += mrr;
    }
    const ae = getAE(d);
    const aeKey = ae.id || "";
    let a = byAEMap.get(aeKey);
    if (!a) { a = { ownerId: ae.id, name: ae.name, totalDeals: 0, totalMRR: 0, _r: new Map() }; byAEMap.set(aeKey, a); }
    a.totalDeals++; a.totalMRR += mrr;
    for (const reason of reasons) {
      let rr = a._r.get(reason);
      if (!rr) { rr = { reason, deals: 0, mrr: 0 }; a._r.set(reason, rr); }
      rr.deals++; rr.mrr += mrr;
    }
  }

  function shape(map, dDeals, dMrr) {
    return [...map.values()].map((r) => ({
      reason: r.reason, deals: r.deals, mrr: round(r.mrr),
      pct: dDeals ? round((r.deals / dDeals) * 100, 1) : 0,
      mrrPct: dMrr ? round((r.mrr / dMrr) * 100, 1) : 0,
    })).sort((a, b) => b.deals - a.deals);
  }

  const out = {
    totalDeals, totalMRR: round(totalMRR),
    reasons: shape(byReasonOverall, totalDeals, totalMRR),
    byAE: [...byAEMap.values()].map((a) => ({
      ownerId: a.ownerId, name: a.name,
      totalDeals: a.totalDeals, totalMRR: round(a.totalMRR),
      reasons: shape(a._r, a.totalDeals, a.totalMRR),
    })).sort((a, b) => b.totalDeals - a.totalDeals),
  };
  fs.writeFileSync(path.join(DATA_DIR, outName), JSON.stringify(out, null, 2));
  console.log(`${outName}: ${totalDeals} deals`);
}

buildReasons(
  (d) => inDateRange(d.properties.closedate) && d.properties.dealstage === STAGE_CLOSEDWON,
  "secondary_win_reasons",
  `win-reasons-${FILE_SUFFIX}.json`,
);
buildReasons(
  (d) =>
    inDateRange(d.properties.closedate) &&
    d.properties.dealstage === STAGE_CLOSEDLOST &&
    !!d.properties.opportunity_qualified_date,
  "loss_reason__c",
  `loss-reasons-${FILE_SUFFIX}.json`,
);

console.log("\nAll 8 data files written.");
