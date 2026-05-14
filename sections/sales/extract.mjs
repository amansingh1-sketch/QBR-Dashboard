// Re-extracts QBR data from HubSpot for the fiscal quarter Feb 1 → Apr 30, 2026.
// Writes JSON files into ./data that the Next.js app consumes at build time.
//
// Usage: `node scripts/extract-data.mjs`
// Requires HUBSPOT_ACCESS_TOKEN in .env.local (auto-loaded).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "data", "sales");

// -------- env loader --------
const envFile = path.join(ROOT, ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
if (!TOKEN) {
  console.error("HUBSPOT_ACCESS_TOKEN missing");
  process.exit(1);
}

const BASE = "https://api.hubapi.com";
const Q_START = "2026-02-01";
const Q_END   = "2026-04-30";
const Q_KEY   = `${Q_START}__${Q_END}`;
const FILE_SUFFIX = "q1-fy2026"; // file naming convention preserved

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
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
function inferRegion(teamName) {
  const u = (teamName || "").toUpperCase();
  if (u.includes("NAMER") || u.includes("NORTH AMERICA") || u.includes("AMERICAS")) return "NAMER";
  if (u.includes("EMEA") || u.includes("EUROPE") || u.includes("MIDDLE EAST") || u.includes("AFRICA")) return "EMEA";
  if (u.includes("APAC") || u.includes("ASIA") || u.includes("PACIFIC") || u.includes("ANZ")) return "APAC";
  return "Unknown";
}
function ownerName(o) {
  if (!o) return "";
  return [o.firstName, o.lastName].filter(Boolean).join(" ").trim();
}
function ownerRegion(o) {
  if (!o?.teams?.length) return "Unknown";
  const primary = o.teams.find((t) => t.primary) ?? o.teams[0];
  return inferRegion(primary.name);
}
function dealTypeKey(raw) {
  const v = (raw || "").toLowerCase().trim();
  if (v === "land") return "land";
  if (v === "expand horizontal" || v === "expand h") return "expandH";
  if (v === "expand vertical" || v === "expand v") return "expandV";
  return null;
}
const NEW_BIZ_TYPES = new Set(["Land", "Expand Horizontal", "Expand Vertical"]);
const NB_FILTER = { propertyName: "dealtype", operator: "IN", values: [...NEW_BIZ_TYPES] };

// -------- HubSpot fetchers --------
async function hsGET(p) {
  const r = await fetch(BASE + p, { headers });
  if (!r.ok) throw new Error(`GET ${p} -> ${r.status} ${await r.text()}`);
  return r.json();
}
async function hsPOST(p, body) {
  const r = await fetch(BASE + p, { method: "POST", headers, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`POST ${p} -> ${r.status} ${await r.text()}`);
  return r.json();
}

async function fetchAllOwners() {
  const out = [];
  let after;
  while (true) {
    const params = new URLSearchParams({ includeTeams: "true", limit: "500" });
    if (after) params.set("after", after);
    const data = await hsGET(`/crm/v3/owners?${params}`);
    out.push(...(data.results ?? []));
    if (data.paging?.next?.after) after = data.paging.next.after;
    else break;
  }
  return out;
}

async function searchAllDeals(filterGroups, properties) {
  const out = [];
  let after;
  while (true) {
    const body = { filterGroups, properties, limit: 200, sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }], ...(after !== undefined ? { after } : {}) };
    const data = await hsPOST("/crm/v3/objects/deals/search", body);
    out.push(...(data.results ?? []));
    if (data.paging?.next?.after) after = data.paging.next.after;
    else break;
  }
  return out;
}

// -------- Property discovery --------
async function discoverProperties() {
  const data = await hsGET("/crm/v3/properties/deals");
  const all = (data.results ?? []).map((p) => p.name);
  const find = (re) => all.filter((n) => re.test(n));
  console.log("Win-reason candidates:", find(/win.*reason|won.*reason/i));
  console.log("Loss-reason candidates:", find(/lost.*reason|loss.*reason/i));
  console.log("Secondary candidates:",   find(/secondary/i));
  return all;
}

// -------- Main extraction --------
async function main() {
  console.log("Discovering deal properties…");
  const propNames = await discoverProperties();

  // Pick the right field names. Prefer secondary_win_reasons exact match if it exists.
  const SECONDARY_WIN = propNames.find((n) => n === "secondary_win_reasons")
    ?? propNames.find((n) => /secondary.*win/i.test(n))
    ?? "secondary_win_reasons";
  const PRIMARY_WIN = propNames.find((n) => n === "primary_win_reason")
    ?? propNames.find((n) => /primary.*win/i.test(n));
  const LOSS_REASON = propNames.find((n) => n === "loss_reason__c")
    ?? propNames.find((n) => n === "closed_lost_reason")
    ?? propNames.find((n) => /lost.*reason/i.test(n))
    ?? propNames.find((n) => /loss.*reason/i.test(n));
  console.log("Using fields:", { SECONDARY_WIN, PRIMARY_WIN, LOSS_REASON });

  const PROPS = [
    "dealname", "amount", "dealtype", "dealstage", "pipeline",
    "createdate", "closedate", "opportunity_qualified_date",
    "sdr_bdr_ps_owner_role", "sdr_bdr_ps_owner",
    "opp_source___l1", "business_size___discovered",
    "hubspot_owner_id",
    SECONDARY_WIN, PRIMARY_WIN, LOSS_REASON,
  ].filter(Boolean);

  console.log("Fetching owners…");
  const owners = await fetchAllOwners();
  const ownerMap = new Map(owners.map((o) => [o.id, o]));
  console.log(`  ${owners.length} owners`);

  // Wide net: deals whose createdate, opportunity_qualified_date, OR closedate is in period.
  // HubSpot search filterGroups are OR-combined; filters within each group are AND.
  console.log("Fetching deals (wide net for createdate / opp_qualified_date / closedate in period)…");
  const filterGroups = [
    { filters: [
      { propertyName: "createdate", operator: "GTE", value: Q_START },
      { propertyName: "createdate", operator: "LTE", value: Q_END },
      NB_FILTER,
    ] },
    { filters: [
      { propertyName: "opportunity_qualified_date", operator: "GTE", value: Q_START },
      { propertyName: "opportunity_qualified_date", operator: "LTE", value: Q_END },
      NB_FILTER,
    ] },
    { filters: [
      { propertyName: "closedate", operator: "GTE", value: Q_START },
      { propertyName: "closedate", operator: "LTE", value: Q_END },
      NB_FILTER,
    ] },
  ];
  const dealsRaw = await searchAllDeals(filterGroups, PROPS);
  // Dedup
  const dealMap = new Map();
  for (const d of dealsRaw) dealMap.set(d.id, d);
  const deals = [...dealMap.values()];
  console.log(`  ${deals.length} unique deals`);

  // -------- Pre-compute helpers --------
  function P(d) { return d.properties; }
  const repNameMap = new Map(owners.map((o) => [o.id, ownerName(o)]));

  function getAEName(d) {
    const id = P(d).hubspot_owner_id;
    if (!id) return { id: "", name: "Unknown", region: "Unknown" };
    const o = ownerMap.get(id);
    if (o) {
      const n = ownerName(o);
      return { id, name: n || `Owner ${id}`, region: ownerRegion(o) };
    }
    return { id, name: `Unknown (${id})`, region: "Unknown" };
  }

  function emptyDealTypes() {
    return { land: { deals: 0, mrr: 0 }, expandH: { deals: 0, mrr: 0 }, expandV: { deals: 0, mrr: 0 } };
  }
  function addDT(agg, d, mrr) {
    const k = dealTypeKey(P(d).dealtype);
    if (k) { agg[k].deals += 1; agg[k].mrr += mrr; }
  }

  // ===========================================================
  // 1) S2 Pipeline (oqd in period, NB)
  // ===========================================================
  console.log("Aggregating S2 Pipeline…");
  {
    const s2deals = deals.filter((d) => inDateRange(P(d).opportunity_qualified_date) && NEW_BIZ_TYPES.has(P(d).dealtype));
    let totalMRR = 0;
    const totalDT = emptyDealTypes();
    const regionMap = new Map(); // region -> {deals, mrr, dt}
    const roleMap = new Map();
    const repMap = new Map();
    const sourceMap = new Map();

    for (const d of s2deals) {
      const mrr = parseFloat(P(d).amount ?? "0") || 0;
      totalMRR += mrr;
      addDT(totalDT, d, mrr);

      const ae = getAEName(d);
      const region = ae.region;
      let r = regionMap.get(region);
      if (!r) { r = { deals: 0, mrr: 0, ...emptyDealTypes() }; regionMap.set(region, r); }
      r.deals += 1; r.mrr += mrr; addDT(r, d, mrr);

      const rawRole = (P(d).sdr_bdr_ps_owner_role || "").toUpperCase().trim();
      let role = "AE";
      if (rawRole === "SDRS" || rawRole === "SDR") role = "SDR";
      else if (rawRole === "BDRS" || rawRole === "BDR") role = "BDR";
      else if (rawRole === "SALES ASSISTED" || rawRole === "PS") role = "PS";
      let rl = roleMap.get(role);
      if (!rl) { rl = { deals: 0, mrr: 0, ...emptyDealTypes() }; roleMap.set(role, rl); }
      rl.deals += 1; rl.mrr += mrr; addDT(rl, d, mrr);

      if ((role === "SDR" || role === "BDR") && P(d).sdr_bdr_ps_owner) {
        const repId = P(d).sdr_bdr_ps_owner;
        const repName = repNameMap.get(repId) || `Owner ${repId}`;
        let rep = repMap.get(repId);
        if (!rep) { rep = { ownerId: repId, name: repName, role, deals: 0, mrr: 0, ...emptyDealTypes() }; repMap.set(repId, rep); }
        rep.deals += 1; rep.mrr += mrr; addDT(rep, d, mrr);
      }

      const src = P(d).opp_source___l1 || "Unknown";
      let s = sourceMap.get(src);
      if (!s) { s = { deals: 0, mrr: 0, ...emptyDealTypes() }; sourceMap.set(src, s); }
      s.deals += 1; s.mrr += mrr; addDT(s, d, mrr);
    }

    const byRegion = [...regionMap.entries()].map(([region, v]) => ({ region, ...v, mrr: round(v.mrr) })).sort((a, b) => b.mrr - a.mrr);
    const ROLE_ORDER = ["SDR", "BDR", "PS", "AE"];
    const byRole = ROLE_ORDER.map((role) => ({ role, ...(roleMap.get(role) ?? { deals: 0, mrr: 0, ...emptyDealTypes() }), mrr: round(roleMap.get(role)?.mrr ?? 0) }));
    const bySdrBdr = [...repMap.values()].map((r) => ({ ...r, mrr: round(r.mrr) })).sort((a, b) => b.mrr - a.mrr);
    const byOppSource = [...sourceMap.entries()].map(([source, v]) => ({ source, ...v, mrr: round(v.mrr) })).sort((a, b) => b.mrr - a.mrr);

    const out = {
      totalDeals: s2deals.length,
      totalMRR: round(totalMRR),
      avgDealSize: s2deals.length ? round(totalMRR / s2deals.length) : 0,
      byDealType: { land: { deals: totalDT.land.deals, mrr: round(totalDT.land.mrr) }, expandH: { deals: totalDT.expandH.deals, mrr: round(totalDT.expandH.mrr) }, expandV: { deals: totalDT.expandV.deals, mrr: round(totalDT.expandV.mrr) } },
      byRegion, byRole, bySdrBdr, byOppSource,
    };
    fs.writeFileSync(path.join(DATA_DIR, `s2-pipeline-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
    console.log(`  ${s2deals.length} S2 deals, MRR ${round(totalMRR)}`);
  }

  // ===========================================================
  // 2) S1 → S2% (with deal type splits)
  // ===========================================================
  console.log("Aggregating S1→S2…");
  {
    const s1deals = deals.filter((d) => inDateRange(P(d).createdate) && NEW_BIZ_TYPES.has(P(d).dealtype));
    let totalS1 = 0, totalS2 = 0, totalS1Mrr = 0, totalS2Mrr = 0;
    const aeMap = new Map();
    const sdrMap = new Map();

    for (const d of s1deals) {
      const mrr = parseFloat(P(d).amount ?? "0") || 0;
      const isS2 = !!P(d).opportunity_qualified_date;
      totalS1 += 1; totalS1Mrr += mrr;
      if (isS2) { totalS2 += 1; totalS2Mrr += mrr; }

      // By AE — using deal owner
      const ae = getAEName(d);
      const aeKey = ae.id || "";
      let r = aeMap.get(aeKey);
      if (!r) { r = { ownerId: ae.id, name: ae.name, s1Deals: 0, s2Deals: 0, s1Mrr: 0, s2Mrr: 0, s1: emptyDealTypes(), s2: emptyDealTypes() }; aeMap.set(aeKey, r); }
      r.s1Deals += 1; r.s1Mrr += mrr; addDT(r.s1, d, mrr);
      if (isS2) { r.s2Deals += 1; r.s2Mrr += mrr; addDT(r.s2, d, mrr); }

      // By SDR/BDR — using sdr_bdr_ps_owner
      const rawRole = (P(d).sdr_bdr_ps_owner_role || "").toUpperCase().trim();
      let role = null;
      if (rawRole === "SDRS" || rawRole === "SDR") role = "SDR";
      else if (rawRole === "BDRS" || rawRole === "BDR") role = "BDR";
      const repId = P(d).sdr_bdr_ps_owner;
      if (role && repId) {
        const repName = repNameMap.get(repId) || `Owner ${repId}`;
        let rep = sdrMap.get(repId);
        if (!rep) { rep = { ownerId: repId, name: repName, role, s1Deals: 0, s2Deals: 0, s1Mrr: 0, s2Mrr: 0, s1: emptyDealTypes(), s2: emptyDealTypes() }; sdrMap.set(repId, rep); }
        rep.s1Deals += 1; rep.s1Mrr += mrr; addDT(rep.s1, d, mrr);
        if (isS2) { rep.s2Deals += 1; rep.s2Mrr += mrr; addDT(rep.s2, d, mrr); }
      }
    }

    function shapeRow(r) {
      const conversionPct = r.s1Deals ? round((r.s2Deals / r.s1Deals) * 100, 1) : 0;
      const fmtSplits = (sp) => ({
        land: { deals: sp.land.deals, mrr: round(sp.land.mrr) },
        expandH: { deals: sp.expandH.deals, mrr: round(sp.expandH.mrr) },
        expandV: { deals: sp.expandV.deals, mrr: round(sp.expandV.mrr) },
      });
      return {
        ownerId: r.ownerId, name: r.name, ...(r.role ? { role: r.role } : {}),
        s1Deals: r.s1Deals, s2Deals: r.s2Deals,
        s1Mrr: round(r.s1Mrr), s2Mrr: round(r.s2Mrr),
        conversionPct,
        s1: fmtSplits(r.s1), s2: fmtSplits(r.s2),
      };
    }

    const byAE = [...aeMap.values()].sort((a, b) => b.s1Deals - a.s1Deals).map(shapeRow);
    const bySdr = [...sdrMap.values()].sort((a, b) => b.s1Deals - a.s1Deals).map(shapeRow);

    const out = {
      totalS1Deals: totalS1, totalS2Deals: totalS2,
      totalS1Mrr: round(totalS1Mrr), totalS2Mrr: round(totalS2Mrr),
      conversionPct: totalS1 ? round((totalS2 / totalS1) * 100, 1) : 0,
      byAE, bySdr,
    };
    fs.writeFileSync(path.join(DATA_DIR, `s1-s2-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
    console.log(`  S1=${totalS1} S2=${totalS2}`);
  }

  // ===========================================================
  // 3) Win Rate (S2 cohort + Close Date cohort, both with byAE)
  // ===========================================================
  console.log("Aggregating Win Rate…");
  {
    const isWon  = (d) => (P(d).dealstage || "").toLowerCase() === "closedwon";
    const isLost = (d) => (P(d).dealstage || "").toLowerCase() === "closedlost";

    function buildCohort(dealsInCohort) {
      const overall = { won: 0, lost: 0, wonMrr: 0, lostMrr: 0, wonDT: emptyDealTypes(), lostDT: emptyDealTypes() };
      const plus    = { won: 0, lost: 0, wonMrr: 0, lostMrr: 0, wonDT: emptyDealTypes(), lostDT: emptyDealTypes() };
      const minus   = { won: 0, lost: 0, wonMrr: 0, lostMrr: 0, wonDT: emptyDealTypes(), lostDT: emptyDealTypes() };

      for (const d of dealsInCohort) {
        const mrr = parseFloat(P(d).amount ?? "0") || 0;
        const won = isWon(d), lost = isLost(d);
        if (!won && !lost) continue;
        const sz = P(d).business_size___discovered;
        const big = sz && /100\+|100 \+|100\+ employees/i.test(sz);
        const buckets = [overall, big ? plus : minus];
        for (const b of buckets) {
          if (won) { b.won += 1; b.wonMrr += mrr; addDT(b.wonDT, d, mrr); }
          else     { b.lost += 1; b.lostMrr += mrr; addDT(b.lostDT, d, mrr); }
        }
      }
      const shape = (b) => ({
        won: b.won, lost: b.lost, total: b.won + b.lost,
        winRate: (b.won + b.lost) ? round((b.won / (b.won + b.lost)) * 100, 1) : 0,
        wonMrr: round(b.wonMrr), lostMrr: round(b.lostMrr),
        wonByDealType:  { land: { deals: b.wonDT.land.deals, mrr: round(b.wonDT.land.mrr) }, expandH: { deals: b.wonDT.expandH.deals, mrr: round(b.wonDT.expandH.mrr) }, expandV: { deals: b.wonDT.expandV.deals, mrr: round(b.wonDT.expandV.mrr) } },
        lostByDealType: { land: { deals: b.lostDT.land.deals, mrr: round(b.lostDT.land.mrr) }, expandH: { deals: b.lostDT.expandH.deals, mrr: round(b.lostDT.expandH.mrr) }, expandV: { deals: b.lostDT.expandV.deals, mrr: round(b.lostDT.expandV.mrr) } },
      });
      return { overall: shape(overall), "100plus": shape(plus), "100minus": shape(minus) };
    }

    function buildByAE(dealsInCohort) {
      const m = new Map();
      for (const d of dealsInCohort) {
        const won = isWon(d), lost = isLost(d);
        if (!won && !lost) continue;
        const ae = getAEName(d);
        const key = ae.id || "";
        let r = m.get(key);
        if (!r) { r = { ownerId: ae.id, name: ae.name, region: ae.region, won: 0, lost: 0, wonMrr: 0, lostMrr: 0, wonDT: emptyDealTypes(), lostDT: emptyDealTypes() }; m.set(key, r); }
        const mrr = parseFloat(P(d).amount ?? "0") || 0;
        if (won) { r.won += 1; r.wonMrr += mrr; addDT(r.wonDT, d, mrr); }
        else     { r.lost += 1; r.lostMrr += mrr; addDT(r.lostDT, d, mrr); }
      }
      return [...m.values()].map((r) => ({
        ownerId: r.ownerId, name: r.name, region: r.region,
        won: r.won, lost: r.lost, total: r.won + r.lost,
        winRate: (r.won + r.lost) ? round((r.won / (r.won + r.lost)) * 100, 1) : 0,
        wonMrr: round(r.wonMrr), lostMrr: round(r.lostMrr),
        wonByDealType:  { land: { deals: r.wonDT.land.deals, mrr: round(r.wonDT.land.mrr) }, expandH: { deals: r.wonDT.expandH.deals, mrr: round(r.wonDT.expandH.mrr) }, expandV: { deals: r.wonDT.expandV.deals, mrr: round(r.wonDT.expandV.mrr) } },
        lostByDealType: { land: { deals: r.lostDT.land.deals, mrr: round(r.lostDT.land.mrr) }, expandH: { deals: r.lostDT.expandH.deals, mrr: round(r.lostDT.expandH.mrr) }, expandV: { deals: r.lostDT.expandV.deals, mrr: round(r.lostDT.expandV.mrr) } },
      })).sort((a, b) => b.total - a.total);
    }

    const s2Cohort = deals.filter((d) => inDateRange(P(d).opportunity_qualified_date) && NEW_BIZ_TYPES.has(P(d).dealtype));
    const cdCohort = deals.filter((d) => inDateRange(P(d).closedate) && NEW_BIZ_TYPES.has(P(d).dealtype));

    const out = {
      byCohort: { s2: buildCohort(s2Cohort), closeDate: buildCohort(cdCohort) },
      byAE_s2: buildByAE(s2Cohort),
      byAE_closeDate: buildByAE(cdCohort),
    };
    fs.writeFileSync(path.join(DATA_DIR, `win-rate-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
    console.log(`  S2 cohort=${s2Cohort.length} CD cohort=${cdCohort.length}`);
  }

  // ===========================================================
  // 4) Bookings (closedate in period AND closedwon)
  // ===========================================================
  console.log("Aggregating Bookings…");
  {
    const bookings = deals.filter((d) => inDateRange(P(d).closedate) && (P(d).dealstage || "").toLowerCase() === "closedwon" && NEW_BIZ_TYPES.has(P(d).dealtype));

    let totalDeals = 0, totalMRR = 0;
    const regionMap = new Map();
    const aeMap = new Map();
    const sourceMap = new Map();
    const subTypeMap = new Map();

    for (const d of bookings) {
      const mrr = parseFloat(P(d).amount ?? "0") || 0;
      totalDeals += 1; totalMRR += mrr;

      const ae = getAEName(d);
      let region = ae.region;

      let r = regionMap.get(region);
      if (!r) { r = { region, deals: 0, mrr: 0, ...emptyDealTypes() }; regionMap.set(region, r); }
      r.deals += 1; r.mrr += mrr; addDT(r, d, mrr);

      const aeKey = ae.id || "";
      let a = aeMap.get(aeKey);
      if (!a) { a = { ownerId: ae.id, name: ae.name, region, deals: 0, mrr: 0, ...emptyDealTypes() }; aeMap.set(aeKey, a); }
      a.deals += 1; a.mrr += mrr; addDT(a, d, mrr);

      const src = P(d).opp_source___l1 || "Unknown";
      let s = sourceMap.get(src);
      if (!s) { s = { source: src, deals: 0, mrr: 0, ...emptyDealTypes() }; sourceMap.set(src, s); }
      s.deals += 1; s.mrr += mrr; addDT(s, d, mrr);

      // Sub-type — Annual vs Monthly vs Multi-year. Heuristic: detect from dealname/deal_term, fall back to Monthly.
      // We don't have the explicit field; inferring via "annual" or "year" tokens. Keeping prior shape.
      const dn = (P(d).dealname || "").toLowerCase();
      let st = "Monthly";
      if (/multi[-\s]?year|3[-\s]?year|2[-\s]?year/.test(dn)) st = "Multiyear";
      else if (/annual|yearly|year/.test(dn)) st = "Annual";
      let sub = subTypeMap.get(st);
      if (!sub) { sub = { type: st, deals: 0, mrr: 0 }; subTypeMap.set(st, sub); }
      sub.deals += 1; sub.mrr += mrr;
    }

    const fmtSplit = (r) => ({ land: { deals: r.land.deals, mrr: round(r.land.mrr) }, expandH: { deals: r.expandH.deals, mrr: round(r.expandH.mrr) }, expandV: { deals: r.expandV.deals, mrr: round(r.expandV.mrr) } });
    const byRegion = [...regionMap.values()].map((r) => ({ region: r.region, deals: r.deals, mrr: round(r.mrr), ...fmtSplit(r) })).sort((a, b) => b.mrr - a.mrr);
    const byAE = [...aeMap.values()].map((r) => ({ ownerId: r.ownerId, name: r.name, region: r.region, deals: r.deals, mrr: round(r.mrr), ...fmtSplit(r) })).sort((a, b) => b.mrr - a.mrr);
    const bySource = [...sourceMap.values()].map((r) => ({ source: r.source, deals: r.deals, mrr: round(r.mrr), ...fmtSplit(r) })).sort((a, b) => b.mrr - a.mrr);
    const totalSubMRR = [...subTypeMap.values()].reduce((s, r) => s + r.mrr, 0);
    const bySubType = [...subTypeMap.values()].map((r) => ({ type: r.type, deals: r.deals, mrr: round(r.mrr), pct: totalSubMRR ? round((r.mrr / totalSubMRR) * 100, 1) : 0 })).sort((a, b) => b.mrr - a.mrr);

    const out = {
      totalDeals, totalMRR: round(totalMRR), avgDealSize: totalDeals ? round(totalMRR / totalDeals) : 0,
      byRegion, byAE, bySource, bySubType,
    };
    fs.writeFileSync(path.join(DATA_DIR, `bookings-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
    console.log(`  ${totalDeals} won, MRR ${round(totalMRR)}`);
  }

  // ===========================================================
  // 5) ACV (same set as bookings, but with 100plus/minus splits)
  // ===========================================================
  console.log("Aggregating ACV…");
  {
    const wonDeals = deals.filter((d) => inDateRange(P(d).closedate) && (P(d).dealstage || "").toLowerCase() === "closedwon" && NEW_BIZ_TYPES.has(P(d).dealtype));
    function emptyACV() { return { deals: 0, totalMRR: 0 }; }
    function shapeACV(b) {
      const totalACV = b.totalMRR * 12;
      return { deals: b.deals, totalMRR: round(b.totalMRR), totalACV: round(totalACV), avgACV: b.deals ? round(totalACV / b.deals) : 0 };
    }
    const overall = emptyACV(), plus = emptyACV(), minus = emptyACV();
    const aeMap = new Map(), regionMap = new Map();
    for (const d of wonDeals) {
      const mrr = parseFloat(P(d).amount ?? "0") || 0;
      const sz = P(d).business_size___discovered;
      const big = sz && /100\+|100 \+|100\+ employees/i.test(sz);
      overall.deals += 1; overall.totalMRR += mrr;
      const sub = big ? plus : minus; sub.deals += 1; sub.totalMRR += mrr;

      const ae = getAEName(d);
      const aeKey = ae.id || "";
      let a = aeMap.get(aeKey);
      if (!a) { a = { ownerId: ae.id, name: ae.name, region: ae.region, overall: emptyACV(), "100plus": emptyACV(), "100minus": emptyACV() }; aeMap.set(aeKey, a); }
      a.overall.deals += 1; a.overall.totalMRR += mrr;
      const sa = big ? a["100plus"] : a["100minus"]; sa.deals += 1; sa.totalMRR += mrr;

      let r = regionMap.get(ae.region);
      if (!r) { r = { region: ae.region, overall: emptyACV(), "100plus": emptyACV(), "100minus": emptyACV() }; regionMap.set(ae.region, r); }
      r.overall.deals += 1; r.overall.totalMRR += mrr;
      const sr = big ? r["100plus"] : r["100minus"]; sr.deals += 1; sr.totalMRR += mrr;
    }
    const out = {
      overall: shapeACV(overall), "100plus": shapeACV(plus), "100minus": shapeACV(minus),
      byAE: [...aeMap.values()].map((a) => ({ ownerId: a.ownerId, name: a.name, region: a.region, overall: shapeACV(a.overall), "100plus": shapeACV(a["100plus"]), "100minus": shapeACV(a["100minus"]) })).sort((a, b) => b.overall.totalMRR - a.overall.totalMRR),
      byRegion: [...regionMap.values()].map((r) => ({ region: r.region, overall: shapeACV(r.overall), "100plus": shapeACV(r["100plus"]), "100minus": shapeACV(r["100minus"]) })).sort((a, b) => b.overall.totalMRR - a.overall.totalMRR),
    };
    fs.writeFileSync(path.join(DATA_DIR, `acv-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  }

  // ===========================================================
  // 6) Sales Cycle (closedate − createdate, won deals)
  // ===========================================================
  console.log("Aggregating Sales Cycle…");
  {
    const wonDeals = deals.filter((d) => inDateRange(P(d).closedate) && (P(d).dealstage || "").toLowerCase() === "closedwon" && NEW_BIZ_TYPES.has(P(d).dealtype));
    function days(d) {
      const cd = P(d).closedate, cr = P(d).createdate;
      if (!cd || !cr) return null;
      const ms = new Date(cd).getTime() - new Date(cr).getTime();
      return Math.max(0, Math.round(ms / 86400000));
    }
    function statify(arr) {
      if (!arr.length) return { deals: 0, avgDays: 0, medianDays: 0, minDays: 0, maxDays: 0 };
      const avg = arr.reduce((s, n) => s + n, 0) / arr.length;
      return { deals: arr.length, avgDays: round(avg, 1), medianDays: round(median(arr), 1), minDays: Math.min(...arr), maxDays: Math.max(...arr) };
    }
    const all = []; const aeMap = new Map(); const regionMap = new Map();
    for (const d of wonDeals) {
      const dy = days(d); if (dy == null) continue;
      all.push(dy);
      const ae = getAEName(d);
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
  }

  // ===========================================================
  // 7) Win Reasons — using SECONDARY_WIN, with byAE breakdown
  // ===========================================================
  console.log("Aggregating Win Reasons…");
  {
    const wonDeals = deals.filter((d) => inDateRange(P(d).closedate) && (P(d).dealstage || "").toLowerCase() === "closedwon" && NEW_BIZ_TYPES.has(P(d).dealtype));
    const byReasonOverall = new Map();
    const byAE = new Map();
    let totalDeals = 0, totalMRR = 0;

    for (const d of wonDeals) {
      const mrr = parseFloat(P(d).amount ?? "0") || 0;
      totalDeals += 1; totalMRR += mrr;
      const raw = P(d)[SECONDARY_WIN] ?? "";
      // HubSpot multi-checkbox values are semicolon-separated
      const reasons = String(raw).split(";").map((s) => s.trim()).filter(Boolean);
      if (!reasons.length) reasons.push("(No reason)");
      for (const reason of reasons) {
        let r = byReasonOverall.get(reason); if (!r) { r = { reason, deals: 0, mrr: 0 }; byReasonOverall.set(reason, r); }
        r.deals += 1; r.mrr += mrr;
      }
      const ae = getAEName(d);
      const aeKey = ae.id || "";
      let a = byAE.get(aeKey); if (!a) { a = { ownerId: ae.id, name: ae.name, totalDeals: 0, totalMRR: 0, _reasons: new Map() }; byAE.set(aeKey, a); }
      a.totalDeals += 1; a.totalMRR += mrr;
      for (const reason of reasons) {
        let rr = a._reasons.get(reason); if (!rr) { rr = { reason, deals: 0, mrr: 0 }; a._reasons.set(reason, rr); }
        rr.deals += 1; rr.mrr += mrr;
      }
    }

    function shapeReasons(map, denomDeals, denomMRR) {
      return [...map.values()]
        .map((r) => ({
          reason: r.reason, deals: r.deals, mrr: round(r.mrr),
          pct: denomDeals ? round((r.deals / denomDeals) * 100, 1) : 0,
          mrrPct: denomMRR ? round((r.mrr / denomMRR) * 100, 1) : 0,
        }))
        .sort((a, b) => b.deals - a.deals);
    }

    const out = {
      totalDeals, totalMRR: round(totalMRR),
      reasons: shapeReasons(byReasonOverall, totalDeals, totalMRR),
      byAE: [...byAE.values()]
        .map((a) => ({ ownerId: a.ownerId, name: a.name, totalDeals: a.totalDeals, totalMRR: round(a.totalMRR), reasons: shapeReasons(a._reasons, a.totalDeals, a.totalMRR) }))
        .sort((a, b) => b.totalDeals - a.totalDeals),
    };
    fs.writeFileSync(path.join(DATA_DIR, `win-reasons-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  }

  // ===========================================================
  // 8) Loss Reasons — using LOSS_REASON, with byAE breakdown
  // ===========================================================
  console.log("Aggregating Loss Reasons…");
  {
    const lostDeals = deals.filter((d) => inDateRange(P(d).closedate) && (P(d).dealstage || "").toLowerCase() === "closedlost" && NEW_BIZ_TYPES.has(P(d).dealtype));
    const byReasonOverall = new Map();
    const byAE = new Map();
    let totalDeals = 0, totalMRR = 0;

    for (const d of lostDeals) {
      const mrr = parseFloat(P(d).amount ?? "0") || 0;
      totalDeals += 1; totalMRR += mrr;
      const raw = LOSS_REASON ? (P(d)[LOSS_REASON] ?? "") : "";
      const reasons = String(raw).split(";").map((s) => s.trim()).filter(Boolean);
      if (!reasons.length) reasons.push("(No reason)");
      for (const reason of reasons) {
        let r = byReasonOverall.get(reason); if (!r) { r = { reason, deals: 0, mrr: 0 }; byReasonOverall.set(reason, r); }
        r.deals += 1; r.mrr += mrr;
      }
      const ae = getAEName(d);
      const aeKey = ae.id || "";
      let a = byAE.get(aeKey); if (!a) { a = { ownerId: ae.id, name: ae.name, totalDeals: 0, totalMRR: 0, _reasons: new Map() }; byAE.set(aeKey, a); }
      a.totalDeals += 1; a.totalMRR += mrr;
      for (const reason of reasons) {
        let rr = a._reasons.get(reason); if (!rr) { rr = { reason, deals: 0, mrr: 0 }; a._reasons.set(reason, rr); }
        rr.deals += 1; rr.mrr += mrr;
      }
    }
    function shapeReasons(map, denomDeals, denomMRR) {
      return [...map.values()].map((r) => ({
        reason: r.reason, deals: r.deals, mrr: round(r.mrr),
        pct: denomDeals ? round((r.deals / denomDeals) * 100, 1) : 0,
        mrrPct: denomMRR ? round((r.mrr / denomMRR) * 100, 1) : 0,
      })).sort((a, b) => b.deals - a.deals);
    }
    const out = {
      totalDeals, totalMRR: round(totalMRR),
      reasons: shapeReasons(byReasonOverall, totalDeals, totalMRR),
      byAE: [...byAE.values()].map((a) => ({ ownerId: a.ownerId, name: a.name, totalDeals: a.totalDeals, totalMRR: round(a.totalMRR), reasons: shapeReasons(a._reasons, a.totalDeals, a.totalMRR) })).sort((a, b) => b.totalDeals - a.totalDeals),
    };
    fs.writeFileSync(path.join(DATA_DIR, `loss-reasons-${FILE_SUFFIX}.json`), JSON.stringify(out, null, 2));
  }

  console.log("\nAll data files written to data/ for", Q_KEY);
}

main().catch((e) => { console.error(e); process.exit(1); });
