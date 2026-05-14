import { getBrandData, getProductData, getGrowthData, getAdSpendsData } from "./data";
import MarketingContent from "./components/MarketingContent";
import type { FiscalQuarter } from "@/lib/shared/types";
import type { MarketingTabId } from "./tabs";

interface Props {
  fq: FiscalQuarter;
  activeTab: MarketingTabId;
}

export default async function MarketingSection({ fq, activeTab }: Props) {
  const [brandData, productData, growthData, adSpendsData] = await Promise.all([
    getBrandData(fq.startDate, fq.endDate),
    getProductData(fq.startDate, fq.endDate),
    getGrowthData(fq.startDate, fq.endDate),
    getAdSpendsData(fq.startDate, fq.endDate),
  ]);

  return (
    <MarketingContent
      activeTab={activeTab}
      initialBrand={brandData}
      initialProduct={productData}
      initialGrowth={growthData}
      initialAdSpends={adSpendsData}
    />
  );
}
