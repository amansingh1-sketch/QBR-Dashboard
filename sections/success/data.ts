// Static JSON loaders for the Customer Success section.

import type {
  MrrChangeData,
  SuccessMetricsData,
  ProductAdoptionData,
  ExpansionPipelineData,
  NrrDeepdiveData,
} from "./types";

import mrrChangeQ1 from "../../data/success/mrr-change-q1-fy2026.json";
import successMetricsQ1 from "../../data/success/success-metrics-q1-fy2026.json";
import productAdoptionQ1 from "../../data/success/product-adoption-q1-fy2026.json";
import expansionPipelineQ1 from "../../data/success/expansion-pipeline-q1-fy2026.json";
import nrrDeepdive from "../../data/success/nrr-deepdive.json";

const Q1_KEY = "2026-02-01__2026-04-30";

const mrrChangeMap: Record<string, MrrChangeData> = { [Q1_KEY]: mrrChangeQ1 as unknown as MrrChangeData };
const successMetricsMap: Record<string, SuccessMetricsData> = { [Q1_KEY]: successMetricsQ1 as unknown as SuccessMetricsData };
const productAdoptionMap: Record<string, ProductAdoptionData> = { [Q1_KEY]: productAdoptionQ1 as unknown as ProductAdoptionData };
const expansionPipelineMap: Record<string, ExpansionPipelineData> = { [Q1_KEY]: expansionPipelineQ1 as unknown as ExpansionPipelineData };

const emptyTable = { months: [], starting_mrr: [], new: [], expansion: [], downgrade: [], churn: [], reactivation: [], closing_mrr: [], net_expansions: [], net_expansion_pct: [] };
const emptySegment = { new_customers: null, existing_customers: null, total: null };
const emptyMrrData: MrrChangeData = { total: emptySegment, scaled: emptySegment, strategic: emptySegment };
const emptyCohort = { total: 0, totalAmount: 0, byStage: [] };
const emptyPipelineSegment = { createdInQ1: emptyCohort, closedInQ1: emptyCohort, openIntoQ2: emptyCohort };

export async function getMrrChangeData(startDate: string, endDate: string): Promise<MrrChangeData> {
  return mrrChangeMap[`${startDate}__${endDate}`] ?? emptyMrrData;
}

export async function getSuccessMetricsData(startDate: string, endDate: string): Promise<SuccessMetricsData> {
  return successMetricsMap[`${startDate}__${endDate}`] ?? { months: [], plan_upgrades: [], m2a: [], a2m: [], aiva_activations: [], aiva_deactivations: [] };
}

export async function getProductAdoptionData(startDate: string, endDate: string): Promise<ProductAdoptionData> {
  return productAdoptionMap[`${startDate}__${endDate}`] ?? { months: [], cohorts: {} };
}

export async function getExpansionPipelineData(startDate: string, endDate: string): Promise<ExpansionPipelineData> {
  return expansionPipelineMap[`${startDate}__${endDate}`] ?? { all: emptyPipelineSegment, aiva: emptyPipelineSegment };
}

export async function getNrrDeepdiveData(): Promise<NrrDeepdiveData> {
  return nrrDeepdive as unknown as NrrDeepdiveData;
}
