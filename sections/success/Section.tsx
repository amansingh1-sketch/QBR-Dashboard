// Customer Success section entry. Switches on activeTab and renders one tab.

import { getMrrChangeData, getSuccessMetricsData, getProductAdoptionData, getExpansionPipelineData, getNrrDeepdiveData } from "./data";
import NetExpansions from "./components/NetExpansions";
import SuccessMetrics from "./components/SuccessMetrics";
import ProductAdoption from "./components/ProductAdoption";
import ExpansionPipeline from "./components/ExpansionPipeline";
import NrrDeepdive from "./components/NrrDeepdive";
import type { FiscalQuarter } from "@/lib/shared/types";
import type { SuccessTabId } from "./tabs";

interface Props {
  fq: FiscalQuarter;
  activeTab: SuccessTabId;
}

export default async function SuccessSection({ fq, activeTab }: Props) {
  switch (activeTab) {
    case "net-expansions": {
      const data = await getMrrChangeData(fq.startDate, fq.endDate);
      return <NetExpansions data={data} />;
    }
    case "success-metrics": {
      const data = await getSuccessMetricsData(fq.startDate, fq.endDate);
      return <SuccessMetrics data={data} />;
    }
    case "product-adoption": {
      const data = await getProductAdoptionData(fq.startDate, fq.endDate);
      return <ProductAdoption data={data} />;
    }
    case "expansion-pipeline": {
      const data = await getExpansionPipelineData(fq.startDate, fq.endDate);
      return (
        <ExpansionPipeline
          segment={data.all}
          title="Expansion Pipeline"
          subtitle="CS Expansion pipeline (excl. Renewal / Annual Conversion deal types)."
        />
      );
    }
    case "aiva-pipeline": {
      const data = await getExpansionPipelineData(fq.startDate, fq.endDate);
      return (
        <ExpansionPipeline
          segment={data.aiva}
          title="AIVA Expansion Pipeline"
          subtitle="CS Expansion pipeline filtered to AIVA add-ons (Voice Agent / Outbound Voice Agent)."
        />
      );
    }
    case "nrr-deepdive": {
      const data = await getNrrDeepdiveData();
      return <NrrDeepdive data={data} />;
    }
  }
}
