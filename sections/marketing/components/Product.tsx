"use client";

import { useState } from "react";
import SubTabs from "./SubTabs";
import KpiTable from "./KpiTable";
import TrendChart from "./TrendChart";
import type { ProductData } from "../types";

const SUB_TABS = [
  { id: "website", label: "Website" },
  { id: "in-app",  label: "Product / In-App" },
  { id: "sales",   label: "Sales" },
] as const;

interface Props {
  data: ProductData;
}

export default function Product({ data }: Props) {
  const [activeSub, setActiveSub] = useState<string>("website");

  const table =
    activeSub === "website" ? data.website :
    activeSub === "in-app"  ? data.inApp :
                              data.sales;

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Product</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Website page performance, in-app activation, and sales-side product signals.
          </p>
        </div>
      </div>

      <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />

      <TrendChart table={table} variant="line" />
      <KpiTable table={table} />
    </section>
  );
}
