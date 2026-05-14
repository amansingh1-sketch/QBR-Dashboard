"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { fmtNumber } from "@/lib/shared/format";
import type { SalesCycleAERow } from "@/sections/sales/types";
import ThresholdLegend from "@/lib/shared/ui/ThresholdLegend";

const REGION_COLOR: Record<string, string> = {
  NAMER: "#6366f1",
  EMEA:  "#10b981",
  APAC:  "#f59e0b",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{d?.fullName}</p>
      <p className="text-xs text-gray-400 mb-1">{d?.region}</p>
      <p className="text-indigo-600">Avg: <span className="font-bold">{d?.avgDays} days</span></p>
      <p className="text-gray-600">Median: <span className="font-bold">{d?.medianDays} days</span></p>
      <p className="text-gray-600">Deals: <span className="font-bold">{fmtNumber(d?.deals ?? 0)}</span></p>
      <p className="text-gray-500 text-xs">Range: {d?.minDays}–{d?.maxDays} days</p>
    </div>
  );
};

export default function ByAE({ data, overallMedian }: { data: SalesCycleAERow[]; overallMedian: number }) {
  // Filter out unknowns and sort by avg days
  const filtered = data.filter((r) => r.deals >= 2).sort((a, b) => a.avgDays - b.avgDays);

  const chartData = filtered.map((r) => ({
    name: r.name.split(" ")[0],
    fullName: r.name,
    avgDays: r.avgDays,
    medianDays: r.medianDays,
    minDays: r.minDays,
    maxDays: r.maxDays,
    deals: r.deals,
    region: r.region,
  }));

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
      <div className="flex justify-end gap-4 pb-2 text-xs text-gray-600">
        {Object.entries(REGION_COLOR).map(([r, c]) => (
          <div key={r} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: c }} />{r}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-4 border-t-2 border-dashed border-red-400" />
          Overall Median
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={40} label={{ value: "Days", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#94a3b8" } }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={overallMedian} stroke="#f87171" strokeDasharray="6 4" strokeWidth={1.5} />
          <Bar dataKey="avgDays" radius={[4, 4, 0, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={REGION_COLOR[d.region] ?? "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-center font-medium text-gray-500">#</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-500">AE</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-500">Region</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-500">Deals</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-500">Avg Days</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-500">Median</th>
              <th className="px-4 py-2.5 text-center font-medium text-gray-500">Range</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const isAboveMedian = row.medianDays > overallMedian;
              return (
                <tr key={row.ownerId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2.5 text-center text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2.5 text-center font-medium text-gray-800">{row.name}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: (REGION_COLOR[row.region] ?? "#94a3b8") + "20",
                        color: REGION_COLOR[row.region] ?? "#64748b",
                      }}
                    >
                      {row.region}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-600">{fmtNumber(row.deals)}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600">
                    {row.avgDays}d
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`font-semibold ${isAboveMedian ? "text-amber-600" : "text-emerald-600"}`}>
                      {row.medianDays}d
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-500 text-xs">{row.minDays}–{row.maxDays}d</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
