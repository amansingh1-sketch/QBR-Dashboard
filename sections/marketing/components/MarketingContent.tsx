"use client";

import { useState, useCallback } from "react";
import Brand from "./Brand";
import Product from "./Product";
import Growth from "./Growth";
import RefreshButton from "./RefreshButton";
import { refreshMarketingData } from "../refresh-action";
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
  const [brand, setBrand] = useState(initialBrand);
  const [product, setProduct] = useState(initialProduct);
  const [growth, setGrowth] = useState(initialGrowth);
  const [adSpends, setAdSpends] = useState(initialAdSpends);

  const handleRefresh = useCallback(async (): Promise<string | null> => {
    const result = await refreshMarketingData();
    if (!result.ok) return result.error;
    setBrand(result.data.brand);
    setProduct(result.data.product);
    setGrowth(result.data.growth);
    setAdSpends(result.data.adSpends);
    return null;
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      {activeTab === "brand" && <Brand data={brand} />}
      {activeTab === "mkt-product" && <Product data={product} />}
      {activeTab === "growth" && <Growth data={growth} adSpendsData={adSpends} />}
    </div>
  );
}
