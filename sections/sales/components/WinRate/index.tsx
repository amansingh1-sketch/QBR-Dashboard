"use client";

import { useState } from "react";
import OrgSizeBreakdown from "./OrgSizeBreakdown";
import ByAE from "./ByAE";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import DealTypeFilter, { ALL_DEAL_TYPES, applyDealTypeFilter, type DealTypeKey } from "@/sections/sales/components/DealTypeFilter";
import type { WinRateData, WinRateCohort, WinRateStats, WinRateAERow } from "@/sections/sales/types";

const TABS = [
  { id: "s2",          label: "S2 cohort" },
  { id: "closeDate",   label: "Close date cohort" },
  { id: "aeS2",        label: "By AE (S2 cohort)" },
  { id: "aeCloseDate", label: "By AE (Close date)" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  data: WinRateData;
  periodLabel: string;
}

/** Apply deal-type filter to a WinRateStats record */
function filterStats(s: WinRateStats, selected: Set<DealTypeKey>): WinRateStats {
  const won = applyDealTypeFilter(
    { deals: s.won, mrr: s.wonMrr, ...s.wonByDealType },
    selected,
  );
  const lost = applyDealTypeFilter(
    { deals: s.lost, mrr: s.lostMrr, ...s.lostByDealType },
    selected,
  );
  const total = won.deals + lost.deals;
  return {
    won: won.deals,
    lost: lost.deals,
    total,
    winRate: total > 0 ? parseFloat(((won.deals / total) * 100).toFixed(1)) : 0,
    wonMrr: won.mrr,
    lostMrr: lost.mrr,
    wonByDealType: s.wonByDealType,
    lostByDealType: s.lostByDealType,
  };
}

function filterCohort(c: WinRateCohort, selected: Set<DealTypeKey>): WinRateCohort {
  return {
    overall: filterStats(c.overall, selected),
    "100plus": filterStats(c["100plus"], selected),
    "100minus": filterStats(c["100minus"], selected),
  };
}

function filterAERow(r: WinRateAERow, selected: Set<DealTypeKey>, includeOpen: boolean): WinRateAERow {
  const won = applyDealTypeFilter(
    { deals: r.won, mrr: r.wonMrr, ...r.wonByDealType },
    selected,
  );
  const lost = applyDealTypeFilter(
    { deals: r.lost, mrr: r.lostMrr, ...r.lostByDealType },
    selected,
  );
  // No deal-type split for open; pass it through (best-effort when partial filters are applied).
  const open = includeOpen ? (r.open ?? 0) : 0;
  const denom = includeOpen ? won.deals + lost.deals + open : won.deals + lost.deals;
  return {
    ...r,
    won: won.deals,
    lost: lost.deals,
    open,
    total: denom,
    winRate: denom > 0 ? parseFloat(((won.deals / denom) * 100).toFixed(1)) : 0,
    wonMrr: won.mrr,
    lostMrr: lost.mrr,
  };
}

export default function WinRate({ data, periodLabel }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("s2");
  const [selectedTypes, setSelectedTypes] = useState<Set<DealTypeKey>>(new Set(ALL_DEAL_TYPES));

  const s2 = filterCohort(data.byCohort.s2, selectedTypes);
  const closeDate = filterCohort(data.byCohort.closeDate, selectedTypes);
  const byAE_s2 = data.byAE_s2.map((r) => filterAERow(r, selectedTypes, true));
  const byAE_closeDate = data.byAE_closeDate.map((r) => filterAERow(r, selectedTypes, false));

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
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border-l-4 border-teal-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">S2 Win Rate</p>
          <p className="mt-1 text-2xl font-bold text-teal-700">{s2.overall.winRate}%</p>
          <p className="text-xs text-gray-500">Cohorted on opp qualified date</p>
        </div>
        <div className="rounded-xl border-l-4 border-slate-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Close Date Win Rate</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{closeDate.overall.winRate}%</p>
          <p className="text-xs text-gray-500">Cohorted on close date</p>
        </div>
        <div className="rounded-xl border-l-4 border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">S2 Won MRR</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{fmtMRR(s2.overall.wonMrr)}</p>
          <p className="text-xs text-gray-500">{fmtNumber(s2.overall.won)} deals won</p>
        </div>
        <div className="rounded-xl border-l-4 border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Close Date Won MRR</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{fmtMRR(closeDate.overall.wonMrr)}</p>
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
          {activeTab === "s2"          && <OrgSizeBreakdown cohort={s2}        label="S2 cohort" />}
          {activeTab === "closeDate"   && <OrgSizeBreakdown cohort={closeDate} label="Close date cohort" />}
          {activeTab === "aeS2"        && <ByAE data={byAE_s2}        showS1Conv showOpen />}
          {activeTab === "aeCloseDate" && <ByAE data={byAE_closeDate} showS1Conv={false} />}
        </div>
      </div>
    </section>
  );
}
