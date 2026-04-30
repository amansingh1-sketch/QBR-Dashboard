"use client";

import { useState } from "react";
import StatCard from "@/components/ui/StatCard";
import ByAE from "./ByAE";
import ByRegion from "./ByRegion";
import { fmtMRR, fmtNumber } from "@/lib/format";
import type { ACVData } from "@/lib/types";

type Cohort = "overall" | "100plus" | "100minus";

const COHORT_OPTIONS: { id: Cohort; label: string }[] = [
  { id: "overall",  label: "All" },
  { id: "100plus",  label: "100+" },
  { id: "100minus", label: "100−" },
];

const TABS = [
  { id: "region", label: "By Region" },
  { id: "ae",     label: "By AE" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ACVProps {
  data: ACVData;
  periodLabel: string;
}

export default function ACV({ data, periodLabel }: ACVProps) {
  const [cohort, setCohort] = useState<Cohort>("overall");
  const [activeTab, setActiveTab] = useState<TabId>("region");

  const bucket = cohort === "overall" ? data.overall : data[cohort];
  const cohortLabel = cohort === "overall" ? "All Org Sizes" : cohort === "100plus" ? "100+ Employees" : "< 100 Employees";

  return (
    <section className="space-y-6">
      {/* Section header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">ACV Mix</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            ACV = MRR × 12 · Closed Won · New Business ·{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">business_size___discovered</code>
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {periodLabel}
        </span>
      </div>

      {/* Cohort toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {COHORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setCohort(opt.id)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              cohort === opt.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="Deals"
          value={fmtNumber(bucket.deals)}
          sub={cohortLabel}
          accent="indigo"
        />
        <StatCard
          label="Total ACV"
          value={fmtMRR(bucket.totalACV)}
          sub="MRR × 12"
          accent="emerald"
        />
        <StatCard
          label="Avg ACV"
          value={fmtMRR(bucket.avgACV)}
          sub="Per deal"
          accent="violet"
        />
        <StatCard
          label="Total MRR"
          value={fmtMRR(bucket.totalMRR)}
          sub="Monthly recurring"
          accent="indigo"
        />
      </div>

      {/* Comparison cards – always visible */}
      {cohort === "overall" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">100+ Org Size</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{fmtMRR(data["100plus"].avgACV)}</p>
            <p className="text-sm text-gray-600">
              avg ACV · {fmtNumber(data["100plus"].deals)} deals · {fmtMRR(data["100plus"].totalACV)} total
            </p>
          </div>
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600">&lt; 100 Org Size</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{fmtMRR(data["100minus"].avgACV)}</p>
            <p className="text-sm text-gray-600">
              avg ACV · {fmtNumber(data["100minus"].deals)} deals · {fmtMRR(data["100minus"].totalACV)} total
            </p>
          </div>
        </div>
      )}

      {/* Tabbed breakdown */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <nav className="flex overflow-x-auto border-b border-gray-100" aria-label="ACV breakdown tabs">
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
          {activeTab === "region" && <ByRegion data={data.byRegion} cohort={cohort} />}
          {activeTab === "ae"     && <ByAE     data={data.byAE}     cohort={cohort} />}
        </div>
      </div>
    </section>
  );
}
