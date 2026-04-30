"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { fmtNumber } from "@/lib/format";
import type { SalesCycleRegionRow } from "@/lib/types";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-indigo-600">Avg: <span className="font-bold">{d?.avgDays} days</span></p>
      <p className="text-gray-600">Median: <span className="font-bold">{d?.medianDays} days</span></p>
      <p className="text-gray-600">Deals: <span className="font-bold">{fmtNumber(d?.deals ?? 0)}</span></p>
      <p className="text-gray-500 text-xs">Range: {d?.minDays}–{d?.maxDays} days</p>
    </div>
  );
};

export default function ByRegion({ data, overallAvg }: { data: SalesCycleRegionRow[]; overallAvg: number }) {
  const filtered = data.filter((r) => r.deals > 0);

  return (
    <>
      <div className="flex justify-end gap-5 pb-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-indigo-400" />Avg Days</div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-4 border-t-2 border-dashed border-red-400" />
          Overall Avg
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={filtered} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="region" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={40} label={{ value: "Days", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#94a3b8" } }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={overallAvg} stroke="#f87171" strokeDasharray="6 4" strokeWidth={1.5} />
          <Bar dataKey="avgDays" radius={[4, 4, 0, 0]}>
            {filtered.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Region</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Deals</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Avg Days</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Median</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Range</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const isAboveAvg = row.avgDays > overallAvg;
              return (
                <tr key={row.region} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2 font-medium text-gray-800">{row.region}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{fmtNumber(row.deals)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`font-semibold ${isAboveAvg ? "text-amber-600" : "text-emerald-600"}`}>
                      {row.avgDays}d
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">{row.medianDays}d</td>
                  <td className="px-4 py-2 text-right text-gray-500 text-xs">{row.minDays}–{row.maxDays}d</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
