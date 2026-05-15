"use client";

import Brand from "./Brand";
import Product from "./Product";
import Growth from "./Growth";
import type { BrandData, ProductData, GrowthData, AdSpendsData } from "../types";
import type { MarketingTabId } from "../tabs";

interface Props {
  activeTab: MarketingTabId;
  initialBrand: BrandData;
  initialProduct: ProductData;
  initialGrowth: GrowthData;
  initialAdSpends: AdSpendsData;
}

export default function MarketingContent({
  activeTab,
  initialBrand,
  initialProduct,
  initialGrowth,
  initialAdSpends,
}: Props) {
  return (
    <div className="space-y-4">
      {activeTab === "brand" && <Brand data={initialBrand} />}
      {activeTab === "mkt-product" && <Product data={initialProduct} />}
      {activeTab === "growth" && <Growth data={initialGrowth} adSpendsData={initialAdSpends} />}
    </div>
  );
}
