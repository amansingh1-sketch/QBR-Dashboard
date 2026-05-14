"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import StatCard from "@/lib/shared/ui/StatCard";
import { fmtNumber } from "@/lib/shared/format";
import type { SuccessMetricsData } from "../../types";

interface Props {
  data: SuccessMetricsData;
}

const MONTH_LABELS: Record<string, string> = {
  "2026-02-01": "Feb 2026",
  "2026-03-01": "Mar 2026",
  "2026-04-01": "Apr 2026",
};

export default function SuccessMetrics({ data }: Props) {
  const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0);
  const totalUpgrades = sum(data.plan_upgrades);
  const totalM2A = sum(data.m2a);
  const totalAIVA = sum(data.aiva_activations);

  const chartData = data.months.map((m, i) => ({
    month: MONTH_LABELS[m] ?? m,
    "Plan Upgrades": data.plan_upgrades[i] ?? 0,
    "Monthly→Annual": data.m2a[i] ?? 0,
    "AIVA Activations": data.aiva_activations[i] ?? 0,
  }));

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Success Metrics</h2>
        <p className="text-sm text-gray-500">Customer movements during Q1 (Feb – Apr 2026).</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="# Plan Upgrades" value={fmtNumber(totalUpgrades)} sub="Q1 total" accent="indigo" />
        <StatCard label="# Monthly→Annual" value={fmtNumber(totalM2A)} sub="M2A conversions, Q1" accent="emerald" />
        <StatCard label="# AIVA Activations" value={fmtNumber(totalAIVA)} sub="Inactive→Active, Q1" accent="violet" />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">Monthly trend</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={36} />
            <Tooltip />
            <Bar dataKey="Plan Upgrades" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Monthly→Annual" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="AIVA Activations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-indigo-500" />Plan Upgrades</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-500" />Monthly→Annual</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-violet-500" />AIVA Activations</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Metric</th>
              {data.months.map((m) => (
                <th key={m} className="px-4 py-2 text-right font-medium text-gray-500">{MONTH_LABELS[m] ?? m}</th>
              ))}
              <th className="px-4 py-2 text-right font-medium text-gray-500">Q1 Total</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "# Plan Upgrades", values: data.plan_upgrades, total: totalUpgrades },
              { label: "# Monthly→Annual (M2A)", values: data.m2a, total: totalM2A },
              { label: "# Annual→Monthly (A2M)", values: data.a2m, total: sum(data.a2m) },
              { label: "# AIVA Activations", values: data.aiva_activations, total: totalAIVA },
              { label: "# AIVA Deactivations", values: data.aiva_deactivations, total: sum(data.aiva_deactivations) },
            ].map((r, i) => (
              <tr key={r.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-4 py-2 font-medium text-gray-800">{r.label}</td>
                {r.values.map((v, j) => (
                  <td key={j} className="px-4 py-2 text-right text-gray-600">{fmtNumber(v ?? 0)}</td>
                ))}
                <td className="px-4 py-2 text-right font-semibold text-indigo-600">{fmtNumber(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
