"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { fmtNumber } from "@/lib/shared/format";
import type { SalesCycleRegionRow } from "@/sections/sales/types";
import ThresholdLegend from "@/lib/shared/ui/ThresholdLegend";

const COLORS = ["#6B8CAE", "#8B7FA8", "#06b6d4", "#f59e0b", "#5B9B8E"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-slate-700">Median: <span className="font-bold">{d?.medianDays} days</span></p>
      <p className="text-gray-600">Avg: <span className="font-bold">{d?.avgDays} days</span></p>
      <p className="text-gray-600">Deals: <span className="font-bold">{fmtNumber(d?.deals ?? 0)}</span></p>
      <p className="text-gray-500 text-xs">Range: {d?.minDays}–{d?.maxDays} days</p>
    </div>
  );
};

export default function ByRegion({ data, overallMedian }: { data: SalesCycleRegionRow[]; overallMedian: number }) {
  const filtered = data.filter((r) => r.deals > 0);

  return (
    <>
      <div className="mb-2 flex justify-end">
        <ThresholdLegend
          metric="Median vs Overall"
          tiers={[
            { color: "emerald", label: "≤ overall median (faster)" },
            { color: "amber",   label: "> overall median (slower)" },
          ]}
        />
      </div>
      <div className="flex justify-end gap-5 pb-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-indigo-400" />Median Days</div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-4 border-t-2 border-dashed border-red-400" />
          Overall Median
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={filtered} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="region" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={40} label={{ value: "Days", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#94a3b8" } }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={overallMedian} stroke="#f87171" strokeDasharray="6 4" strokeWidth={1.5} />
          <Bar dataKey="medianDays" radius={[4, 4, 0, 0]}>
            {filtered.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-center font-medium text-gray-500">Region</th>
              <th className="px-4 py-2 text-center font-medium text-gray-500">Deals</th>
              <th className="px-4 py-2 text-center font-medium text-gray-500">Avg Days</th>
              <th className="px-4 py-2 text-center font-medium text-gray-500">Median</th>
              <th className="px-4 py-2 text-center font-medium text-gray-500">Range</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const isAboveMedian = row.medianDays > overallMedian;
              return (
                <tr key={row.region} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2 text-center font-medium text-gray-800">{row.region}</td>
                  <td className="px-4 py-2 text-center text-gray-600">{fmtNumber(row.deals)}</td>
                  <td className="px-4 py-2 text-center text-gray-600">{row.avgDays}d</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`font-semibold ${isAboveMedian ? "text-amber-700" : "text-teal-700"}`}>
                      {row.medianDays}d
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-gray-500 text-xs">{row.minDays}–{row.maxDays}d</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
