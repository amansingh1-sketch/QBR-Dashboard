"use client";

import { useState } from "react";
import StatCard from "@/components/ui/StatCard";
import DealTypeFilter, { ALL_DEAL_TYPES, type DealTypeKey, applyDealTypeFilter } from "@/components/ui/DealTypeFilter";
import ByRegion from "./ByRegion";
import ByAE from "./ByAE";
import BySource from "./BySource";
import BySubType from "./BySubType";
import { fmtMRR, fmtNumber } from "@/lib/format";
import type { BookingsData } from "@/lib/types";

const TABS = [
  { id: "region",  label: "By Region" },
  { id: "ae",      label: "By AE" },
  { id: "source",  label: "By Source" },
  { id: "subtype", label: "Annual vs Monthly" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface BookingsProps {
  data: BookingsData;
  periodLabel: string;
}

export default function Bookings({ data, periodLabel }: BookingsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("region");
  const [selectedTypes, setSelectedTypes] = useState<Set<DealTypeKey>>(new Set(ALL_DEAL_TYPES));

  // Compute filtered totals from byRegion rows
  let totalDeals = 0;
  let totalMRR = 0;
  for (const row of data.byRegion) {
    const { deals, mrr } = applyDealTypeFilter(row, selectedTypes);
    totalDeals += deals;
    totalMRR += mrr;
  }
  const avgDealSize = totalDeals > 0 ? totalMRR / totalDeals : 0;

  return (
    <section className="space-y-6">
      {/* Section header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            New Business pipeline · Closed Won · Land, Expand H, Expand V ·{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">closedate</code>
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {periodLabel}
        </span>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Closed Won Deals"
          value={fmtNumber(totalDeals)}
          sub="New Business · All deal types"
          accent="indigo"
        />
        <StatCard
          label="Total MRR Booked"
          value={fmtMRR(totalMRR)}
          sub="Sum of deal amounts"
          accent="emerald"
        />
        <StatCard
          label="ACV"
          value={fmtMRR(avgDealSize * 12)}
          sub="Avg deal size × 12"
          accent="violet"
        />
      </div>

      {/* Tabbed breakdown */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pr-4">
          <nav className="flex overflow-x-auto" aria-label="Bookings breakdown tabs">
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

        <div className="p-6">
          {activeTab === "region"  && <ByRegion  data={data.byRegion}  selectedTypes={selectedTypes} />}
          {activeTab === "ae"      && <ByAE      data={data.byAE}      selectedTypes={selectedTypes} />}
          {activeTab === "source"  && <BySource  data={data.bySource}  selectedTypes={selectedTypes} />}
          {activeTab === "subtype" && <BySubType data={data.bySubType} />}
        </div>
      </div>
    </section>
  );
}
