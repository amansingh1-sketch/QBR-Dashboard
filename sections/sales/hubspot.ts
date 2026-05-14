import type { HubSpotDeal, HubSpotOwner, Region, Role, S2PipelineData } from "./types";

const BASE_URL = "https://api.hubapi.com";
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN!;

function authHeaders() {
  return {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

// ---------------------------------------------------------------------------
// Owners
// ---------------------------------------------------------------------------

export async function fetchAllOwners(): Promise<HubSpotOwner[]> {
  const owners: HubSpotOwner[] = [];
  let after: string | undefined;

  while (true) {
    const params = new URLSearchParams({
      includeTeams: "true",
      limit: "500",
    });
    if (after) params.set("after", after);

    const res = await fetch(`${BASE_URL}/crm/v3/owners?${params}`, {
      headers: authHeaders(),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Owners API error: ${res.status}`);
    const data = await res.json();

    owners.push(...(data.results ?? []));

    if (data.paging?.next?.after) {
      after = data.paging.next.after;
    } else {
      break;
    }
  }
  return owners;
}

// ---------------------------------------------------------------------------
// Deals – HubSpot Search API (POST)
// ---------------------------------------------------------------------------

const S2_DEAL_PROPERTIES = [
  "dealname",
  "amount",
  "dealtype",
  "opportunity_qualified_date",
  "sdr_bdr_ps_owner_role",
  "sdr_bdr_ps_owner",
  "opp_source___l1",
  "business_size___discovered",
  "hubspot_owner_id",
];

interface SearchBody {
  filterGroups: object[];
  properties: string[];
  limit: number;
  after?: number;
}

async function searchDeals(body: SearchBody): Promise<{ results: HubSpotDeal[]; total: number; paging?: { next?: { after: number } } }> {
  const res = await fetch(`${BASE_URL}/crm/v3/objects/deals/search`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Deals search API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function fetchS2Deals(startDate: string, endDate: string): Promise<HubSpotDeal[]> {
  const deals: HubSpotDeal[] = [];
  let after: number | undefined;

  const filterGroups = [
    {
      filters: [
        { propertyName: "opportunity_qualified_date", operator: "GTE", value: startDate },
        { propertyName: "opportunity_qualified_date", operator: "LTE", value: endDate },
        { propertyName: "dealtype", operator: "IN", values: ["Land", "Expand Horizontal", "Expand Vertical"] },
      ],
    },
  ];

  while (true) {
    const body: SearchBody = {
      filterGroups,
      properties: S2_DEAL_PROPERTIES,
      limit: 200,
      ...(after !== undefined ? { after } : {}),
    };

    const data = await searchDeals(body);
    deals.push(...data.results);

    if (data.paging?.next?.after) {
      after = data.paging.next.after;
    } else {
      break;
    }
  }

  return deals;
}

// ---------------------------------------------------------------------------
// Region mapping
// ---------------------------------------------------------------------------

const TEAM_REGION_MAP: Record<string, Region> = {};

function inferRegion(teamName: string): Region {
  const upper = teamName.toUpperCase();
  if (upper.includes("NAMER") || upper.includes("NORTH AMERICA") || upper.includes("AMERICAS") || upper.includes("US ")) return "NAMER";
  if (upper.includes("EMEA") || upper.includes("EUROPE") || upper.includes("MIDDLE EAST") || upper.includes("AFRICA")) return "EMEA";
  if (upper.includes("APAC") || upper.includes("ASIA") || upper.includes("PACIFIC") || upper.includes("ANZ")) return "APAC";
  return "Unknown";
}

function getOwnerRegion(owner: HubSpotOwner | undefined): string {
  if (!owner || !owner.teams || owner.teams.length === 0) return "Unknown";
  const primaryTeam = owner.teams.find((t) => t.primary) ?? owner.teams[0];
  const cached = TEAM_REGION_MAP[primaryTeam.name];
  if (cached) return cached;
  const region = inferRegion(primaryTeam.name);
  // If we can't infer a standard region, return the raw team name so it's still meaningful
  return region === "Unknown" ? primaryTeam.name : region;
}

// ---------------------------------------------------------------------------
// Role normalization
// ---------------------------------------------------------------------------

function normalizeRole(raw: string | null): Role {
  if (!raw) return "AE";
  const upper = raw.toUpperCase().trim();
  if (upper === "SDRS" || upper === "SDR") return "SDR";
  if (upper === "BDRS" || upper === "BDR") return "BDR";
  if (upper === "SALES ASSISTED" || upper === "PS") return "PS";
  return "AE";
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export async function getS2PipelineData(startDate: string, endDate: string): Promise<S2PipelineData> {
  const [deals, owners] = await Promise.all([
    fetchS2Deals(startDate, endDate),
    fetchAllOwners(),
  ]);

  const ownerMap = new Map<string, HubSpotOwner>();
  for (const o of owners) {
    ownerMap.set(o.id, o);
  }

  // Build rep name map from sdr_bdr_ps_owner enumeration
  const repNameMap = new Map<string, string>();
  for (const o of owners) {
    const fullName = [o.firstName, o.lastName].filter(Boolean).join(" ").trim();
    if (fullName) repNameMap.set(o.id, fullName);
  }

  const regionMap = new Map<string, { deals: number; mrr: number }>();
  const roleMap = new Map<Role, { deals: number; mrr: number }>();
  const repMap = new Map<string, { ownerId: string; name: string; role: "SDR" | "BDR"; deals: number; mrr: number }>();
  const sourceMap = new Map<string, { deals: number; mrr: number }>();

  let totalMRR = 0;

  for (const deal of deals) {
    const mrr = parseFloat(deal.properties.amount ?? "0") || 0;
    totalMRR += mrr;

    // Region
    const owner = ownerMap.get(deal.properties.hubspot_owner_id ?? "");
    const region = getOwnerRegion(owner);
    const rEntry = regionMap.get(region) ?? { deals: 0, mrr: 0 };
    regionMap.set(region, { deals: rEntry.deals + 1, mrr: rEntry.mrr + mrr });

    // Role
    const role = normalizeRole(deal.properties.sdr_bdr_ps_owner_role);
    const roleEntry = roleMap.get(role) ?? { deals: 0, mrr: 0 };
    roleMap.set(role, { deals: roleEntry.deals + 1, mrr: roleEntry.mrr + mrr });

    // SDR/BDR Deep Dive
    if ((role === "SDR" || role === "BDR") && deal.properties.sdr_bdr_ps_owner) {
      const repId = deal.properties.sdr_bdr_ps_owner;
      const repName = repNameMap.get(repId) ?? `Owner ${repId}`;
      const existing = repMap.get(repId) ?? { ownerId: repId, name: repName, role, deals: 0, mrr: 0 };
      repMap.set(repId, { ...existing, deals: existing.deals + 1, mrr: existing.mrr + mrr });
    }

    // Opp Source L1
    const source = deal.properties.opp_source___l1 ?? "Unknown";
    const srcEntry = sourceMap.get(source) ?? { deals: 0, mrr: 0 };
    sourceMap.set(source, { deals: srcEntry.deals + 1, mrr: srcEntry.mrr + mrr });
  }

  const byRegion = Array.from(regionMap.entries())
    .map(([region, v]) => ({ region, ...v }))
    .sort((a, b) => b.mrr - a.mrr);

  const ROLE_ORDER: Role[] = ["SDR", "BDR", "PS", "AE"];
  const byRole = ROLE_ORDER.map((role) => ({
    role,
    ...(roleMap.get(role) ?? { deals: 0, mrr: 0 }),
  }));

  const bySdrBdr = Array.from(repMap.values()).sort((a, b) => b.mrr - a.mrr);

  const byOppSource = Array.from(sourceMap.entries())
    .map(([source, v]) => ({ source, ...v }))
    .sort((a, b) => b.mrr - a.mrr);

  const emptyDt = { land: { deals: 0, mrr: 0 }, expandH: { deals: 0, mrr: 0 }, expandV: { deals: 0, mrr: 0 } };
  return {
    totalDeals: deals.length,
    totalMRR,
    avgDealSize: deals.length > 0 ? totalMRR / deals.length : 0,
    byDealType: emptyDt,
    byRegion: byRegion.map((r) => ({ ...emptyDt, ...r })),
    byRole: byRole.map((r) => ({ ...emptyDt, ...r })),
    bySdrBdr: bySdrBdr.map((r) => ({ ...emptyDt, ...r })),
    byOppSource: byOppSource.map((r) => ({ ...emptyDt, ...r })),
  };
}
