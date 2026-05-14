"use client";

import { useState } from "react";
import SubTabs from "./SubTabs";
import KpiTable from "./KpiTable";
import TrendChart from "./TrendChart";
import type { BrandData } from "../types";

const SUB_TABS = [
  { id: "social",     label: "Social Metrics" },
  { id: "reputation", label: "Online Reputation" },
] as const;

interface Props {
  data: BrandData;
}

export default function Brand({ data }: Props) {
  const [activeSub, setActiveSub] = useState<string>("social");

  const table = activeSub === "social" ? data.social : data.reputation;

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Brand</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Social presence and online reputation. Q4 and Q1 shown side-by-side.
          </p>
        </div>
      </div>

      <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />

      <TrendChart table={table} variant="line" />
      <KpiTable table={table} />
    </section>
  );
}
