"use client";

import { useState } from "react";
import ByAE from "./ByAE";
import BySdr from "./BySdr";
import { fmtMRR, fmtNumber } from "@/lib/format";
import DealTypeFilter, { ALL_DEAL_TYPES, type DealTypeKey } from "@/components/ui/DealTypeFilter";
import type { S1S2Data } from "@/lib/types";

const TABS = [
  { id: "ae",  label: "By AE" },
  { id: "sdr", label: "By SDR / BDR" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  data: S1S2Data;
  periodLabel: string;
}

export default function S1S2({ data, periodLabel }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("ae");
  const [selectedTypes, setSelectedTypes] = useState<Set<DealTypeKey>>(new Set(ALL_DEAL_TYPES));

  return (
    <section className="space-y-6">
      {/* Section header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">S1 → S2 Conversion</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            S1 cohorted on <code className="rounded bg-gray-100 px-1 text-xs">createdate</code>
            {" "}· S2 = S1 with <code className="rounded bg-gray-100 px-1 text-xs">opportunity_qualified_date</code> set
            {" "}· Land, Expand H, Expand V
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {periodLabel}
        </span>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border-l-4 border-gray-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">S1 Deals</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{fmtNumber(data.totalS1Deals)}</p>
          <p className="text-xs text-gray-500">Created in period</p>
        </div>
        <div className="rounded-xl border-l-4 border-indigo-500 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">S2 Deals</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{fmtNumber(data.totalS2Deals)}</p>
          <p className="text-xs text-gray-500">Qualified from S1</p>
        </div>
        <div className="rounded-xl border-l-4 border-emerald-500 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">S1→S2%</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{data.conversionPct}%</p>
          <p className="text-xs text-gray-500">Overall conversion</p>
        </div>
        <div className="rounded-xl border-l-4 border-violet-500 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">S2 MRR</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{fmtMRR(data.totalS2Mrr)}</p>
          <p className="text-xs text-gray-500">From {fmtMRR(data.totalS1Mrr)} S1</p>
        </div>
      </div>

      {/* Tabbed breakdown */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Tab bar + filter */}
        <div className="flex items-center justify-between border-b border-gray-100 pr-4">
          <nav className="flex overflow-x-auto" aria-label="S1→S2 breakdown tabs">
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
          {activeTab === "ae"  && <ByAE  data={data.byAE} />}
          {activeTab === "sdr" && <BySdr data={data.bySdr} />}
        </div>
      </div>
    </section>
  );
}
