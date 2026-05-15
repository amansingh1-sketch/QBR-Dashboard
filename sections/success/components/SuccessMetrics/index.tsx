"use client";

import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import StatCard from "@/lib/shared/ui/StatCard";
import { fmtNumber } from "@/lib/shared/format";
import type { SuccessMetricsData, SuccessMetricsTable } from "../../types";

type Segment = "total" | "strategic" | "scaled";

const SEGMENT_LABELS: Record<Segment, string> = {
  total:     "Total",
  strategic: "Strategic",
  scaled:    "Scaled",
};

const MONTH_LABELS: Record<string, string> = {
  "2026-02-01": "Feb 2026",
  "2026-03-01": "Mar 2026",
  "2026-04-01": "Apr 2026",
  "2026-05-01": "May 2026",
};

function getPeriodLabel(months: string[]): string {
  if (months.length === 1) return `${MONTH_LABELS[months[0]] ?? months[0]} (MTD)`;
  if (months.length > 1) {
    const first = MONTH_LABELS[months[0]] ?? months[0];
    const last  = MONTH_LABELS[months[months.length - 1]] ?? months[months.length - 1];
    return `${first} – ${last}`;
  }
  return "";
}

function fmtLabel(m: string) { return MONTH_LABELS[m] ?? m; }

const ROW_DEFS: { key: keyof SuccessMetricsTable; label: string }[] = [
  { key: "plan_upgrades",     label: "# Plan Upgrades"          },
  { key: "plan_downgrades",   label: "# Plan Downgrades"        },
  { key: "m2a",               label: "# Monthly→Annual (M2A)"   },
  { key: "a2m",               label: "# Annual→Monthly (A2M)"   },
  { key: "aiva_activations",  label: "# AIVA Activations"       },
  { key: "aiva_deactivations",label: "# AIVA Deactivations"     },
];

interface Props { data: SuccessMetricsData }

export default function SuccessMetrics({ data }: Props) {
  const [segment, setSegment] = useState<Segment>("total");
  const t: SuccessMetricsTable = data[segment];

  const sum = (arr: number[]) => arr.reduce((s, n) => s + (n ?? 0), 0);
  const totalUpgrades  = sum(t.plan_upgrades);
  const totalM2A       = sum(t.m2a);
  const totalAIVA      = sum(t.aiva_activations);
  const periodLabel    = getPeriodLabel(t.months);
  const isMTD          = t.months.length === 1;
  const periodTag      = isMTD ? "MTD" : "Period";

  const chartData = t.months.map((m, i) => ({
    month:              fmtLabel(m),
    "Plan Upgrades":    t.plan_upgrades[i]    ?? 0,
    "Monthly→Annual":   t.m2a[i]              ?? 0,
    "AIVA Activations": t.aiva_activations[i] ?? 0,
  }));

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Success Metrics</h2>
        <p className="text-sm text-gray-500">Customer movements — {periodLabel}.</p>
      </div>

      {/* Segment switcher */}
      <div className="inline-flex rounded-lg bg-gray-100 p-1">
        {(Object.keys(SEGMENT_LABELS) as Segment[]).map((s) => (
          <button
            key={s}
            onClick={() => setSegment(s)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              segment === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {SEGMENT_LABELS[s]}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="# Plan Upgrades"    value={fmtNumber(totalUpgrades)} sub={`${periodTag} total`} accent="indigo"  />
        <StatCard label="# Monthly→Annual"   value={fmtNumber(totalM2A)}      sub={`M2A conversions, ${periodTag}`} accent="emerald" />
        <StatCard label="# AIVA Activations" value={fmtNumber(totalAIVA)}     sub={`Inactive→Active, ${periodTag}`} accent="violet"  />
      </div>

      {/* Chart */}
      {t.months.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">Monthly trend</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={36} />
              <Tooltip />
              <Bar dataKey="Plan Upgrades"    fill="#6B8CAE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Monthly→Annual"   fill="#5B9B8E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AIVA Activations" fill="#8B7FA8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-slate-500" />Plan Upgrades</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-teal-500" />Monthly→Annual</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-indigo-300" />AIVA Activations</div>
          </div>
        </div>
      )}

      {/* Detail table */}
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Metric</th>
              {t.months.map((m) => (
                <th key={m} className="px-4 py-2 text-center font-medium text-gray-500">{fmtLabel(m)}</th>
              ))}
              <th className="px-4 py-2 text-center font-medium text-gray-500">{isMTD ? "MTD Total" : "Period Total"}</th>
            </tr>
          </thead>
          <tbody>
            {ROW_DEFS.map((rd, i) => {
              const vals = t[rd.key] as number[];
              const total = sum(vals);
              return (
                <tr key={rd.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2 font-medium text-gray-800">{rd.label}</td>
                  {vals.map((v, j) => (
                    <td key={j} className="px-4 py-2 text-center text-gray-600">{fmtNumber(v ?? 0)}</td>
                  ))}
                  <td className="px-4 py-2 text-center font-semibold text-slate-700">{fmtNumber(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
