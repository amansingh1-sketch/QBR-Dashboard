"use client";

import { useState } from "react";
import SummaryCards from "./SummaryCards";
import ByRegion from "./ByRegion";
import ByRole from "./ByRole";
import SdrBdrDeepDive from "./SdrBdrDeepDive";
import ByOppSource from "./ByOppSource";
import DealTypeFilter, { ALL_DEAL_TYPES, type DealTypeKey } from "@/components/ui/DealTypeFilter";
import type { S2PipelineData } from "@/lib/types";

const TABS = [
  { id: "region",  label: "By region" },
  { id: "role",    label: "By role" },
  { id: "reps",    label: "SDR / BDR deep dive" },
  { id: "source",  label: "By source" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface S2PipelineProps {
  data: S2PipelineData;
  periodLabel: string;
}

export default function S2Pipeline({ data, periodLabel }: S2PipelineProps) {
  const [activeTab, setActiveTab] = useState<TabId>("region");
  const [selectedTypes, setSelectedTypes] = useState<Set<DealTypeKey>>(new Set(ALL_DEAL_TYPES));

  return (
    <section className="space-y-6">
      {/* Section header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">S2 Pipeline</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            New business · Cohorted on{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">opportunity_qualified_date</code>
            {" "}· Land, Expand H, Expand V
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {periodLabel}
        </span>
      </div>

      {/* KPI summary cards */}
      <SummaryCards data={data} selectedTypes={selectedTypes} />

      {/* Tabbed breakdown */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Tab bar + filter */}
        <div className="flex items-center justify-between border-b border-gray-100 pr-4">
          <nav className="flex overflow-x-auto" aria-label="S2 breakdown tabs">
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
          <DealTypeFilter selected={selectedTypes} onChange={setSelectedTypes} />
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "region" && <ByRegion data={data.byRegion} selectedTypes={selectedTypes} />}
          {activeTab === "role"   && <ByRole   data={data.byRole}   selectedTypes={selectedTypes} />}
          {activeTab === "reps"   && <SdrBdrDeepDive data={data.bySdrBdr} selectedTypes={selectedTypes} />}
          {activeTab === "source" && <ByOppSource data={data.byOppSource} selectedTypes={selectedTypes} />}
        </div>
      </div>
    </section>
  );
}
