"use client";

import { useState } from "react";
import StatCard from "@/components/ui/StatCard";
import ByAE from "./ByAE";
import ByRegion from "./ByRegion";
import { fmtNumber } from "@/lib/format";
import type { SalesCycleData } from "@/lib/types";

const TABS = [
  { id: "ae",     label: "By AE" },
  { id: "region", label: "By Region" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  data: SalesCycleData;
  periodLabel: string;
}

export default function SalesCycle({ data, periodLabel }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("ae");

  return (
    <section className="space-y-6">
      {/* Section header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sales Cycle</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Days from deal created to Closed Won ·{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">closedate − createdate</code>
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {periodLabel}
        </span>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="Avg Sales Cycle"
          value={`${data.overall.avgDays} days`}
          sub={`${fmtNumber(data.overall.deals)} closed won deals`}
          accent="indigo"
        />
        <StatCard
          label="Median"
          value={`${data.overall.medianDays} days`}
          sub="50th percentile"
          accent="emerald"
        />
        <StatCard
          label="Fastest"
          value={`${data.overall.minDays} days`}
          sub="Minimum cycle"
          accent="violet"
        />
        <StatCard
          label="Longest"
          value={`${data.overall.maxDays} days`}
          sub="Maximum cycle"
          accent="indigo"
        />
      </div>

      {/* Tabbed breakdown */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <nav className="flex overflow-x-auto border-b border-gray-100" aria-label="Sales cycle breakdown tabs">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors
                  ${active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}
                `}
              >
                {tab.label}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          {activeTab === "ae"     && <ByAE     data={data.byAE}     overallAvg={data.overall.avgDays} />}
          {activeTab === "region" && <ByRegion data={data.byRegion} overallAvg={data.overall.avgDays} />}
        </div>
      </div>
    </section>
  );
}
