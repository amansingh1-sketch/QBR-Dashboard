import type { S2PipelineData, S1S2Data, WinRateData, BookingsData, ACVData, SalesCycleData, ReasonsData } from "./types";

// Static JSON imports — bundler includes these at build time
import s2PipelineQ1 from "../data/s2-pipeline-q1-fy2026.json";
import s1S2Q1 from "../data/s1-s2-q1-fy2026.json";
import winRateQ1 from "../data/win-rate-q1-fy2026.json";
import bookingsQ1 from "../data/bookings-q1-fy2026.json";
import acvQ1 from "../data/acv-q1-fy2026.json";
import salesCycleQ1 from "../data/sales-cycle-q1-fy2026.json";
import winReasonsQ1 from "../data/win-reasons-q1-fy2026.json";
import lossReasonsQ1 from "../data/loss-reasons-q1-fy2026.json";

const s2Map: Record<string, S2PipelineData> = {
  "2026-02-01__2026-04-30": s2PipelineQ1 as unknown as S2PipelineData,
};

const s1s2Map: Record<string, S1S2Data> = {
  "2026-02-01__2026-04-30": s1S2Q1 as unknown as S1S2Data,
};

const winRateMap: Record<string, WinRateData> = {
  "2026-02-01__2026-04-30": winRateQ1 as unknown as WinRateData,
};

const bookingsMap: Record<string, BookingsData> = {
  "2026-02-01__2026-04-30": bookingsQ1 as unknown as BookingsData,
};

const acvMap: Record<string, ACVData> = {
  "2026-02-01__2026-04-30": acvQ1 as unknown as ACVData,
};

const salesCycleMap: Record<string, SalesCycleData> = {
  "2026-02-01__2026-04-30": salesCycleQ1 as unknown as SalesCycleData,
};

const winReasonsMap: Record<string, ReasonsData> = {
  "2026-02-01__2026-04-30": winReasonsQ1 as unknown as ReasonsData,
};

const lossReasonsMap: Record<string, ReasonsData> = {
  "2026-02-01__2026-04-30": lossReasonsQ1 as unknown as ReasonsData,
};

export async function getS2PipelineData(
  startDate: string,
  endDate: string
): Promise<S2PipelineData> {
  const key = `${startDate}__${endDate}`;
  const data = s2Map[key];
  if (data) return data;

  const emptyDt = { land: { deals: 0, mrr: 0 }, expandH: { deals: 0, mrr: 0 }, expandV: { deals: 0, mrr: 0 } };
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

export async function getS1S2Data(
  startDate: string,
  endDate: string
): Promise<S1S2Data> {
  const key = `${startDate}__${endDate}`;
  const data = s1s2Map[key];
  if (data) return data;

  return {
    totalS1Deals: 0,
    totalS2Deals: 0,
    totalS1Mrr: 0,
    totalS2Mrr: 0,
    conversionPct: 0,
    byAE: [],
    bySdr: [],
  };
}

export async function getWinRateData(
  startDate: string,
  endDate: string
): Promise<WinRateData> {
  const key = `${startDate}__${endDate}`;
  const data = winRateMap[key];
  if (data) return data;

  const empty = { won: 0, lost: 0, total: 0, winRate: 0, wonMrr: 0, lostMrr: 0 };
  const emptyCohort = { overall: empty, "100plus": empty, "100minus": empty };
  return { byCohort: { s2: emptyCohort, closeDate: emptyCohort }, byAE: [] };
}

export async function getBookingsData(
  startDate: string,
  endDate: string
): Promise<BookingsData> {
  const key = `${startDate}__${endDate}`;
  const data = bookingsMap[key];
  if (data) return data;

  return {
    totalDeals: 0,
    totalMRR: 0,
    avgDealSize: 0,
    byRegion: [],
    byAE: [],
    bySource: [],
    bySubType: [],
  };
}

export async function getACVData(
  startDate: string,
  endDate: string
): Promise<ACVData> {
  const key = `${startDate}__${endDate}`;
  const data = acvMap[key];
  if (data) return data;

  const emptyBucket = { deals: 0, totalMRR: 0, totalACV: 0, avgACV: 0 };
  return { overall: emptyBucket, "100plus": emptyBucket, "100minus": emptyBucket, byAE: [], byRegion: [] };
}

export async function getSalesCycleData(
  startDate: string,
  endDate: string
): Promise<SalesCycleData> {
  const key = `${startDate}__${endDate}`;
  const data = salesCycleMap[key];
  if (data) return data;

  const empty = { deals: 0, avgDays: 0, medianDays: 0, minDays: 0, maxDays: 0 };
  return { overall: empty, byAE: [], byRegion: [] };
}

export async function getWinReasonsData(
  startDate: string,
  endDate: string
): Promise<ReasonsData> {
  const key = `${startDate}__${endDate}`;
  return winReasonsMap[key] ?? { totalDeals: 0, totalMRR: 0, reasons: [] };
}

export async function getLossReasonsData(
  startDate: string,
  endDate: string
): Promise<ReasonsData> {
  const key = `${startDate}__${endDate}`;
  return lossReasonsMap[key] ?? { totalDeals: 0, totalMRR: 0, reasons: [] };
}
