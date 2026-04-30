"use client";

import { useState } from "react";
import OrgSizeBreakdown from "./OrgSizeBreakdown";
import ByAE from "./ByAE";
import { fmtMRR, fmtNumber } from "@/lib/format";
import DealTypeFilter, { ALL_DEAL_TYPES, type DealTypeKey } from "@/components/ui/DealTypeFilter";
import type { WinRateData } from "@/lib/types";

const TABS = [
  { id: "s2",        label: "S2 cohort" },
  { id: "closeDate", label: "Close date cohort" },
  { id: "ae",        label: "By AE" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  data: WinRateData;
  periodLabel: string;
}

export default function WinRate({ data, periodLabel }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("s2");
  const [selectedTypes, setSelectedTypes] = useState<Set<DealTypeKey>>(new Set(ALL_DEAL_TYPES));
  const { s2, closeDate } = data.byCohort;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Win Rate</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Closed Won ÷ (Closed Won + Closed Lost) · Land, Expand H, Expand V
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {periodLabel}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border-l-4 border-emerald-500 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">S2 Win Rate</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{s2.overall.winRate}%</p>
          <p className="text-xs text-gray-500">Cohorted on opp qualified date</p>
        </div>
        <div className="rounded-xl border-l-4 border-indigo-500 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Close Date Win Rate</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{closeDate.overall.winRate}%</p>
          <p className="text-xs text-gray-500">Cohorted on close date</p>
        </div>
        <div className="rounded-xl border-l-4 border-gray-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">S2 Won MRR</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{fmtMRR(s2.overall.wonMrr)}</p>
          <p className="text-xs text-gray-500">{fmtNumber(s2.overall.won)} deals won</p>
        </div>
        <div className="rounded-xl border-l-4 border-violet-500 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Close Date Won MRR</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{fmtMRR(closeDate.overall.wonMrr)}</p>
          <p className="text-xs text-gray-500">{fmtNumber(closeDate.overall.won)} deals won</p>
        </div>
      </div>

      {/* Tabbed breakdown */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pr-4">
          <nav className="flex overflow-x-auto" aria-label="Win rate tabs">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative whitespace-nowrap px-6 py-4 text-sm font-medium transition-colors ${active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {tab.label}
                  {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-900 rounded-full" />}
                </button>
              );
            })}
          </nav>
          <DealTypeFilter selected={selectedTypes} onChange={setSelectedTypes} />
        </div>
        <div className="p-6">
          {activeTab === "s2"        && <OrgSizeBreakdown cohort={s2}        label="S2 cohort" />}
          {activeTab === "closeDate" && <OrgSizeBreakdown cohort={closeDate} label="Close date cohort" />}
          {activeTab === "ae"        && <ByAE data={data.byAE} />}
        </div>
      </div>
    </section>
  );
}
