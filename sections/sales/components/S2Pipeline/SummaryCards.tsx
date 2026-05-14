import StatCard from "@/lib/shared/ui/StatCard";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import { applyDealTypeFilter, type DealTypeKey } from "@/sections/sales/components/DealTypeFilter";
import type { S2PipelineData } from "@/sections/sales/types";

interface Props {
  data: S2PipelineData;
  selectedTypes: Set<DealTypeKey>;
}

export default function SummaryCards({ data, selectedTypes }: Props) {
  // Aggregate totals from byRegion rows (each has land/expandH/expandV splits)
  let totalDeals = 0;
  let totalMRR = 0;
  for (const row of data.byRegion) {
    const { deals, mrr } = applyDealTypeFilter(row, selectedTypes);
    totalDeals += deals;
    totalMRR += mrr;
  }
  const avgDealSize = totalDeals > 0 ? totalMRR / totalDeals : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Total S2 Deals"
        value={fmtNumber(totalDeals)}
        sub="Qualified opportunities"
        accent="indigo"
      />
      <StatCard
        label="Total MRR Pipeline"
        value={fmtMRR(totalMRR)}
        sub="Sum of deal amounts"
        accent="emerald"
      />
      <StatCard
        label="ACV Pipeline"
        value={fmtMRR(totalMRR * 12)}
        sub="Total ACV (MRR × 12)"
        accent="violet"
      />
    </div>
  );
}
