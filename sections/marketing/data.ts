// Static JSON loaders for the Marketing section.

import type { BrandData, ProductData, GrowthData, AdSpendsData } from "./types";

import brandQ1 from "../../data/marketing/brand-q1-fy2026.json";
import productQ1 from "../../data/marketing/product-q1-fy2026.json";
import growthQ1 from "../../data/marketing/growth-q1-fy2026.json";
import adSpendsQ1 from "../../data/marketing/ad-spends-q1-fy2026.json";

const Q1_KEY = "2026-02-01__2026-04-30";

const brandMap: Record<string, BrandData> = { [Q1_KEY]: brandQ1 as unknown as BrandData };
const productMap: Record<string, ProductData> = { [Q1_KEY]: productQ1 as unknown as ProductData };
const growthMap: Record<string, GrowthData> = { [Q1_KEY]: growthQ1 as unknown as GrowthData };
const adSpendsMap: Record<string, AdSpendsData> = { [Q1_KEY]: adSpendsQ1 as unknown as AdSpendsData };

const emptyTable = { title: "", rows: [] };

export async function getBrandData(startDate: string, endDate: string): Promise<BrandData> {
  return brandMap[`${startDate}__${endDate}`] ?? {
    periodLabel: "",
    social: { ...emptyTable, title: "Social Metrics" },
    reputation: { ...emptyTable, title: "Online Reputation" },
  };
}

export async function getProductData(startDate: string, endDate: string): Promise<ProductData> {
  return productMap[`${startDate}__${endDate}`] ?? {
    periodLabel: "",
    website: { ...emptyTable, title: "Website" },
    inApp: { ...emptyTable, title: "Product / In-App" },
    sales: { ...emptyTable, title: "Sales" },
  };
}

export async function getGrowthData(startDate: string, endDate: string): Promise<GrowthData> {
  return growthMap[`${startDate}__${endDate}`] ?? {
    periodLabel: "",
    overallMetrics: { ...emptyTable, title: "Overall Metrics (Total)" },
    websiteEngagement: { ...emptyTable, title: "Website Engagement (Overall)" },
    plg: { ...emptyTable, title: "PLG (SignUps)" },
    slg: { ...emptyTable, title: "SLG (Demos)" },
    cpl: { ...emptyTable, title: "Efficiency & Economics — CPL" },
    cac: { ...emptyTable, title: "Efficiency & Economics — CAC" },
  };
}

export async function getAdSpendsData(startDate: string, endDate: string): Promise<AdSpendsData> {
  return adSpendsMap[`${startDate}__${endDate}`] ?? {
    periodLabel: "",
    table: { ...emptyTable, title: "Ad Spends" },
  };
}
