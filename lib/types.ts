export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount: string | null;
    dealtype: string | null;
    opportunity_qualified_date: string | null;
    sdr_bdr_ps_owner_role: string | null;
    sdr_bdr_ps_owner: string | null;
    opp_source___l1: string | null;
    business_size___discovered: string | null;
    hubspot_owner_id: string | null;
  };
}

export interface HubSpotOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teams: { id: number; name: string; primary: boolean }[];
}

export type Region = "NAMER" | "EMEA" | "APAC" | "Unknown";
export type Role = "SDR" | "BDR" | "PS" | "AE";
export type DealTypeKey = "land" | "expandH" | "expandV";

export interface DealTypeSplit {
  deals: number;
  mrr: number;
}

export interface RegionBreakdown {
  region: Region | string;
  deals: number;
  mrr: number;
  land: DealTypeSplit;
  expandH: DealTypeSplit;
  expandV: DealTypeSplit;
}

export interface RoleBreakdown {
  role: Role;
  deals: number;
  mrr: number;
  land: DealTypeSplit;
  expandH: DealTypeSplit;
  expandV: DealTypeSplit;
}

export interface RepBreakdown {
  name: string;
  ownerId: string;
  role: "SDR" | "BDR";
  deals: number;
  mrr: number;
  land: DealTypeSplit;
  expandH: DealTypeSplit;
  expandV: DealTypeSplit;
}

export interface OppSourceBreakdown {
  source: string;
  deals: number;
  mrr: number;
  land: DealTypeSplit;
  expandH: DealTypeSplit;
  expandV: DealTypeSplit;
}

export interface S2PipelineData {
  totalDeals: number;
  totalMRR: number;
  avgDealSize: number;
  byDealType: { land: DealTypeSplit; expandH: DealTypeSplit; expandV: DealTypeSplit };
  byRegion: RegionBreakdown[];
  byRole: RoleBreakdown[];
  bySdrBdr: RepBreakdown[];
  byOppSource: OppSourceBreakdown[];
}

export interface WinRateStats {
  won: number;
  lost: number;
  total: number;
  winRate: number;
  wonMrr: number;
  lostMrr: number;
}

export interface WinRateCohort {
  overall: WinRateStats;
  "100plus": WinRateStats;
  "100minus": WinRateStats;
}

export interface WinRateAERow {
  ownerId: string;
  name: string;
  won: number;
  lost: number;
  total: number;
  winRate: number;
  wonMrr: number;
  lostMrr: number;
}

export interface WinRateData {
  byCohort: {
    s2: WinRateCohort;
    closeDate: WinRateCohort;
  };
  byAE: WinRateAERow[];
}

export interface S1S2Row {
  ownerId: string;
  name: string;
  role?: string;
  s1Deals: number;
  s2Deals: number;
  s1Mrr: number;
  s2Mrr: number;
  conversionPct: number;
}

export interface S1S2Data {
  totalS1Deals: number;
  totalS2Deals: number;
  totalS1Mrr: number;
  totalS2Mrr: number;
  conversionPct: number;
  byAE: S1S2Row[];
  bySdr: S1S2Row[];
}

export interface BookingsRegionRow {
  region: string;
  deals: number;
  mrr: number;
  land: DealTypeSplit;
  expandH: DealTypeSplit;
  expandV: DealTypeSplit;
}

export interface BookingsAERow {
  ownerId: string;
  name: string;
  region: string;
  deals: number;
  mrr: number;
  land: DealTypeSplit;
  expandH: DealTypeSplit;
  expandV: DealTypeSplit;
}

export interface BookingsSourceRow {
  source: string;
  deals: number;
  mrr: number;
  land: DealTypeSplit;
  expandH: DealTypeSplit;
  expandV: DealTypeSplit;
}

export interface BookingsSubTypeRow {
  type: string;
  deals: number;
  mrr: number;
  pct: number;
}

export interface BookingsData {
  totalDeals: number;
  totalMRR: number;
  avgDealSize: number;
  byRegion: BookingsRegionRow[];
  byAE: BookingsAERow[];
  bySource: BookingsSourceRow[];
  bySubType: BookingsSubTypeRow[];
}

export interface ACVBucket {
  deals: number;
  totalMRR: number;
  totalACV: number;
  avgACV: number;
}

export interface ACVAERow {
  ownerId: string;
  name: string;
  region: string;
  overall: ACVBucket;
  "100plus": ACVBucket;
  "100minus": ACVBucket;
}

export interface ACVRegionRow {
  region: string;
  overall: ACVBucket;
  "100plus": ACVBucket;
  "100minus": ACVBucket;
}

export interface ACVData {
  overall: ACVBucket;
  "100plus": ACVBucket;
  "100minus": ACVBucket;
  byAE: ACVAERow[];
  byRegion: ACVRegionRow[];
}

export interface SalesCycleStats {
  deals: number;
  avgDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
}

export interface SalesCycleAERow extends SalesCycleStats {
  ownerId: string;
  name: string;
  region: string;
}

export interface SalesCycleRegionRow extends SalesCycleStats {
  region: string;
}

export interface SalesCycleData {
  overall: SalesCycleStats;
  byAE: SalesCycleAERow[];
  byRegion: SalesCycleRegionRow[];
}

export interface ReasonRow {
  reason: string;
  deals: number;
  mrr: number;
  pct: number;
  mrrPct: number;
}

export interface ReasonsData {
  totalDeals: number;
  totalMRR: number;
  reasons: ReasonRow[];
}

export interface FiscalQuarter {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;     // e.g. "Q1 FY2026"
}
