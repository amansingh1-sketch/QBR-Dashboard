"use client";

import { useState } from "react";
import DealTypeFilter, { ALL_DEAL_TYPES, type DealTypeKey, applyDealTypeFilter } from "@/sections/sales/components/DealTypeFilter";
import ThresholdLegend from "@/lib/shared/ui/ThresholdLegend";
import ByRegion from "./ByRegion";
import ByAE from "./ByAE";
import BySource from "./BySource";
import BySubType from "./BySubType";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import type { BookingsData } from "@/sections/sales/types";

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
  const totalACV = totalMRR * 12;

  // Quotas come from data (Q1 FY27, active AEs only). Progress bars only show when full deal-type set is selected.
  const showQuota = selectedTypes.size === ALL_DEAL_TYPES.length;
  const mrrQuota = data.totalMrrQuota;
  const acvQuota = data.totalAcvQuota;
  const mrrPct = mrrQuota > 0 ? Math.round((totalMRR / mrrQuota) * 1000) / 10 : 0;
  const acvPct = acvQuota > 0 ? Math.round((totalACV / acvQuota) * 1000) / 10 : 0;

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
      </div>

      {showQuota && (mrrQuota > 0 || acvQuota > 0) && (
        <div className="flex justify-end">
          <ThresholdLegend
            metric="Quota %"
            tiers={[
              { color: "emerald", label: "≥ 100%" },
              { color: "amber",   label: "70–99%" },
              { color: "red",     label: "< 70%" },
            ]}
          />
        </div>
      )}

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-l-4 border-slate-300 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Closed Won Deals</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{fmtNumber(totalDeals)}</p>
          <p className="text-xs text-gray-500">New Business · All deal types</p>
        </div>
        <div className="rounded-xl border-l-4 border-teal-300 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Total MRR Booked</p>
            {showQuota && mrrQuota > 0 && (
              <span className={`text-xs font-semibold ${mrrPct >= 100 ? "text-teal-700" : mrrPct >= 70 ? "text-amber-700" : "text-red-600"}`}>
                {mrrPct}%
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-800">{fmtMRR(totalMRR)}</p>
          {showQuota && mrrQuota > 0 ? (
            <>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${mrrPct >= 100 ? "bg-teal-500" : mrrPct >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(mrrPct, 100)}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-gray-500">vs {fmtMRR(mrrQuota)} quota</p>
            </>
          ) : (
            <p className="text-xs text-gray-500">Sum of deal amounts</p>
          )}
        </div>
        <div className="rounded-xl border-l-4 border-slate-300 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">ACV Booked</p>
            {showQuota && acvQuota > 0 && (
              <span className={`text-xs font-semibold ${acvPct >= 100 ? "text-teal-700" : acvPct >= 70 ? "text-amber-700" : "text-red-600"}`}>
                {acvPct}%
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-800">{fmtMRR(totalACV)}</p>
          {showQuota && acvQuota > 0 ? (
            <>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${acvPct >= 100 ? "bg-teal-500" : acvPct >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(acvPct, 100)}%` }}
                />
              </div>
              <p className="mt-0.5 text-xs text-gray-500">vs {fmtMRR(acvQuota)} quota</p>
            </>
          ) : (
            <p className="text-xs text-gray-500">MRR × 12</p>
          )}
        </div>
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
