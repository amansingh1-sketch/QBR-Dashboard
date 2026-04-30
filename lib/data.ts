import type { S2PipelineData, S1S2Data, WinRateData, BookingsData, ACVData, SalesCycleData, ReasonsData } from "./types";

// Static data files — refreshed by running the MCP fetch script
// Data is stored in /data/ and committed to the repo (no API key needed at runtime)

export async function getS2PipelineData(
  startDate: string,
  endDate: string
): Promise<S2PipelineData> {
  // Map the requested date range to the correct static JSON file
  const key = `${startDate}__${endDate}`;

  const dataMap: Record<string, string> = {
    "2026-02-01__2026-04-30": "s2-pipeline-q1-fy2026",
  };

  const file = dataMap[key];
  if (!file) {
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

  // Dynamic import so Next.js can tree-shake unused data files
  const raw = await import(`../data/${file}.json`);
  return raw.default as S2PipelineData;
}

export async function getS1S2Data(
  startDate: string,
  endDate: string
): Promise<S1S2Data> {
  const key = `${startDate}__${endDate}`;

  const dataMap: Record<string, string> = {
    "2026-02-01__2026-04-30": "s1-s2-q1-fy2026",
  };

  const file = dataMap[key];
  if (!file) {
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

  const raw = await import(`../data/${file}.json`);
  return raw.default as S1S2Data;
}

export async function getWinRateData(
  startDate: string,
  endDate: string
): Promise<WinRateData> {
  const key = `${startDate}__${endDate}`;
  const dataMap: Record<string, string> = {
    "2026-02-01__2026-04-30": "win-rate-q1-fy2026",
  };
  const file = dataMap[key];
  if (!file) {
    const empty = { won: 0, lost: 0, total: 0, winRate: 0, wonMrr: 0, lostMrr: 0 };
    const emptyCohort = { overall: empty, "100plus": empty, "100minus": empty };
    return { byCohort: { s2: emptyCohort, closeDate: emptyCohort }, byAE: [] };
  }
  const raw = await import(`../data/${file}.json`);
  return raw.default as WinRateData;
}

export async function getBookingsData(
  startDate: string,
  endDate: string
): Promise<BookingsData> {
  const key = `${startDate}__${endDate}`;
  const dataMap: Record<string, string> = {
    "2026-02-01__2026-04-30": "bookings-q1-fy2026",
  };
  const file = dataMap[key];
  if (!file) {
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
  const raw = await import(`../data/${file}.json`);
  return raw.default as BookingsData;
}

export async function getACVData(
  startDate: string,
  endDate: string
): Promise<ACVData> {
  const key = `${startDate}__${endDate}`;
  const dataMap: Record<string, string> = {
    "2026-02-01__2026-04-30": "acv-q1-fy2026",
  };
  const file = dataMap[key];
  if (!file) {
    const emptyBucket = { deals: 0, totalMRR: 0, totalACV: 0, avgACV: 0 };
    return { overall: emptyBucket, "100plus": emptyBucket, "100minus": emptyBucket, byAE: [], byRegion: [] };
  }
  const raw = await import(`../data/${file}.json`);
  return raw.default as ACVData;
}

export async function getSalesCycleData(
  startDate: string,
  endDate: string
): Promise<SalesCycleData> {
  const key = `${startDate}__${endDate}`;
  const dataMap: Record<string, string> = {
    "2026-02-01__2026-04-30": "sales-cycle-q1-fy2026",
  };
  const file = dataMap[key];
  if (!file) {
    const empty = { deals: 0, avgDays: 0, medianDays: 0, minDays: 0, maxDays: 0 };
    return { overall: empty, byAE: [], byRegion: [] };
  }
  const raw = await import(`../data/${file}.json`);
  return raw.default as SalesCycleData;
}

export async function getWinReasonsData(
  startDate: string,
  endDate: string
): Promise<ReasonsData> {
  const key = `${startDate}__${endDate}`;
  const dataMap: Record<string, string> = {
    "2026-02-01__2026-04-30": "win-reasons-q1-fy2026",
  };
  const file = dataMap[key];
  if (!file) return { totalDeals: 0, totalMRR: 0, reasons: [] };
  const raw = await import(`../data/${file}.json`);
  return raw.default as ReasonsData;
}

export async function getLossReasonsData(
  startDate: string,
  endDate: string
): Promise<ReasonsData> {
  const key = `${startDate}__${endDate}`;
  const dataMap: Record<string, string> = {
    "2026-02-01__2026-04-30": "loss-reasons-q1-fy2026",
  };
  const file = dataMap[key];
  if (!file) return { totalDeals: 0, totalMRR: 0, reasons: [] };
  const raw = await import(`../data/${file}.json`);
  return raw.default as ReasonsData;
}
