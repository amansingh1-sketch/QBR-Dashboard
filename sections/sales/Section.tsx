// Sales section entry point. Renders one of the Sales tabs based on `activeTab`.
// Each tab is an async server component that loads its own JSON via ./data.

import {
  getS2PipelineData,
  getS1S2Data,
  getWinRateData,
  getBookingsData,
  getACVData,
  getSalesCycleData,
  getWinReasonsData,
  getLossReasonsData,
} from "./data";
import S2Pipeline from "./components/S2Pipeline";
import S1S2 from "./components/S1S2";
import WinRate from "./components/WinRate";
import Bookings from "./components/Bookings";
import ACV from "./components/ACV";
import SalesCycle from "./components/SalesCycle";
import WinReasons from "./components/Reasons/WinReasons";
import LossReasons from "./components/Reasons/LossReasons";
import type { FiscalQuarter } from "@/lib/shared/types";
import type { SalesTabId } from "./tabs";

interface Props {
  fq: FiscalQuarter;
  activeTab: SalesTabId;
}

export default async function SalesSection({ fq, activeTab }: Props) {
  switch (activeTab) {
    case "s2": {
      const data = await getS2PipelineData(fq.startDate, fq.endDate);
      return <S2Pipeline data={data} periodLabel={fq.label} />;
    }
    case "s1s2": {
      const data = await getS1S2Data(fq.startDate, fq.endDate);
      return <S1S2 data={data} periodLabel={fq.label} />;
    }
    case "winrate": {
      const data = await getWinRateData(fq.startDate, fq.endDate);
      return <WinRate data={data} periodLabel={fq.label} />;
    }
    case "bookings": {
      const data = await getBookingsData(fq.startDate, fq.endDate);
      return <Bookings data={data} periodLabel={fq.label} />;
    }
    case "acv": {
      const data = await getACVData(fq.startDate, fq.endDate);
      return <ACV data={data} periodLabel={fq.label} />;
    }
    case "salescycle": {
      const data = await getSalesCycleData(fq.startDate, fq.endDate);
      return <SalesCycle data={data} periodLabel={fq.label} />;
    }
    case "winreasons": {
      const data = await getWinReasonsData(fq.startDate, fq.endDate);
      return <WinReasons data={data} periodLabel={fq.label} />;
    }
    case "lossreasons": {
      const data = await getLossReasonsData(fq.startDate, fq.endDate);
      return <LossReasons data={data} periodLabel={fq.label} />;
    }
  }
}
