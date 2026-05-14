// Static JSON imports for the Sales section. Bundler includes these at build time.
// Each loader is keyed on `${startDate}__${endDate}` so it's trivial to add future quarters
// (just import the new JSON and add the entry to the corresponding map).

import type {
  S2PipelineData,
  S1S2Data,
  WinRateData,
  BookingsData,
  ACVData,
  SalesCycleData,
  ReasonsData,
} from "./types";

import s2PipelineQ1 from "../../data/sales/s2-pipeline-q1-fy2026.json";
import s1S2Q1 from "../../data/sales/s1-s2-q1-fy2026.json";
import winRateQ1 from "../../data/sales/win-rate-q1-fy2026.json";
import bookingsQ1 from "../../data/sales/bookings-q1-fy2026.json";
import acvQ1 from "../../data/sales/acv-q1-fy2026.json";
import salesCycleQ1 from "../../data/sales/sales-cycle-q1-fy2026.json";
import winReasonsQ1 from "../../data/sales/win-reasons-q1-fy2026.json";
import lossReasonsQ1 from "../../data/sales/loss-reasons-q1-fy2026.json";

const Q1_KEY = "2026-02-01__2026-04-30";

const s2Map: Record<string, S2PipelineData> = { [Q1_KEY]: s2PipelineQ1 as unknown as S2PipelineData };
const s1s2Map: Record<string, S1S2Data> = { [Q1_KEY]: s1S2Q1 as unknown as S1S2Data };
const winRateMap: Record<string, WinRateData> = { [Q1_KEY]: winRateQ1 as unknown as WinRateData };
const bookingsMap: Record<string, BookingsData> = { [Q1_KEY]: bookingsQ1 as unknown as BookingsData };
const acvMap: Record<string, ACVData> = { [Q1_KEY]: acvQ1 as unknown as ACVData };
const salesCycleMap: Record<string, SalesCycleData> = { [Q1_KEY]: salesCycleQ1 as unknown as SalesCycleData };
const winReasonsMap: Record<string, ReasonsData> = { [Q1_KEY]: winReasonsQ1 as unknown as ReasonsData };
const lossReasonsMap: Record<string, ReasonsData> = { [Q1_KEY]: lossReasonsQ1 as unknown as ReasonsData };

const emptyDt = { land: { deals: 0, mrr: 0 }, expandH: { deals: 0, mrr: 0 }, expandV: { deals: 0, mrr: 0 } };

export async function getS2PipelineData(startDate: string, endDate: string): Promise<S2PipelineData> {
  const data = s2Map[`${startDate}__${endDate}`];
  if (data) return data;
  return {
    totalDeals: 0,
    totalMRR: 0,
    avgDealSize: 0,
    byDealType: emptyDt,
    byRegion: [],
    byRole: [
      { role: "SDR", deals: 0, mrr: 0, ...emptyDt },
      { role: "BDR", deals: 0, mrr: 0, ...emptyDt },
      { role: "PS",  deals: 0, mrr: 0, ...emptyDt },
      { role: "AE",  deals: 0, mrr: 0, ...emptyDt },
    ],
    bySdrBdr: [],
    byOppSource: [],
  };
}

export async function getS1S2Data(startDate: string, endDate: string): Promise<S1S2Data> {
  const data = s1s2Map[`${startDate}__${endDate}`];
  if (data) return data;
  return {
    totalS1Deals: 0, totalS2Deals: 0, totalS1Mrr: 0, totalS2Mrr: 0,
    conversionPct: 0, s1ByDealType: emptyDt, s2ByDealType: emptyDt,
    byAE: [], bySdr: [],
  };
}

export async function getWinRateData(startDate: string, endDate: string): Promise<WinRateData> {
  const data = winRateMap[`${startDate}__${endDate}`];
  if (data) return data;
  const empty = { won: 0, lost: 0, total: 0, winRate: 0, wonMrr: 0, lostMrr: 0, wonByDealType: emptyDt, lostByDealType: emptyDt };
  const emptyCohort = { overall: empty, "100plus": empty, "100minus": empty };
  return { byCohort: { s2: emptyCohort, closeDate: emptyCohort }, byAE_s2: [], byAE_closeDate: [] };
}

export async function getBookingsData(startDate: string, endDate: string): Promise<BookingsData> {
  const data = bookingsMap[`${startDate}__${endDate}`];
  if (data) return data;
  return {
    totalDeals: 0, totalMRR: 0, totalACV: 0, avgDealSize: 0,
    totalMrrQuota: 0, totalMrrQuotaPct: 0, totalAcvQuota: 0, totalAcvQuotaPct: 0,
    byRegion: [], byAE: [], bySource: [], bySubType: [],
  };
}

export async function getACVData(startDate: string, endDate: string): Promise<ACVData> {
  const data = acvMap[`${startDate}__${endDate}`];
  if (data) return data;
  const emptyBucket = { deals: 0, totalMRR: 0, totalACV: 0, avgACV: 0 };
  return { overall: emptyBucket, "100plus": emptyBucket, "100minus": emptyBucket, byAE: [], byRegion: [] };
}

export async function getSalesCycleData(startDate: string, endDate: string): Promise<SalesCycleData> {
  const data = salesCycleMap[`${startDate}__${endDate}`];
  if (data) return data;
  const empty = { deals: 0, avgDays: 0, medianDays: 0, minDays: 0, maxDays: 0 };
  return { overall: empty, byAE: [], byRegion: [] };
}

export async function getWinReasonsData(startDate: string, endDate: string): Promise<ReasonsData> {
  return winReasonsMap[`${startDate}__${endDate}`] ?? { totalDeals: 0, totalMRR: 0, reasons: [], byAE: [] };
}

export async function getLossReasonsData(startDate: string, endDate: string): Promise<ReasonsData> {
  return lossReasonsMap[`${startDate}__${endDate}`] ?? { totalDeals: 0, totalMRR: 0, reasons: [], byAE: [] };
}
