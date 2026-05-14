"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import type { ACVAERow } from "@/sections/sales/types";

type Cohort = "overall" | "100plus" | "100minus";

const REGION_COLOR: Record<string, string> = {
  NAMER: "#6366f1",
  EMEA:  "#10b981",
  APAC:  "#f59e0b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{d?.fullName ?? label}</p>
      <p className="text-xs text-gray-400 mb-1">{d?.region}</p>
      <p className="text-indigo-600">Total ACV: <span className="font-bold">{fmtMRR(d?.totalACV ?? 0)}</span></p>
      <p className="text-gray-600">Avg ACV: <span className="font-bold">{fmtMRR(d?.avgACV ?? 0)}</span></p>
      <p className="text-gray-600">Deals: <span className="font-bold">{fmtNumber(d?.deals ?? 0)}</span></p>
    </div>
  );
};

function getBucket(row: ACVAERow, cohort: Cohort) {
  return cohort === "overall" ? row.overall : row[cohort];
}

export default function ByAE({ data, cohort }: { data: ACVAERow[]; cohort: Cohort }) {
  const sorted = [...data]
    .map((r) => {
      const b = getBucket(r, cohort);
      return { ...r, ...b, fullName: r.name };
    })
    .filter((r) => r.deals > 0)
    .sort((a, b) => b.totalACV - a.totalACV);

  const chartData = sorted.map((r) => ({
    name: r.name.split(" ")[0],
    totalACV: r.totalACV,
    avgACV: r.avgACV,
    deals: r.deals,
    region: r.region,
    fullName: r.fullName,
  }));

  const totalACV = sorted.reduce((s, r) => s + r.totalACV, 0);

  return (
    <>
      <div className="flex justify-end gap-4 pb-2 text-xs text-gray-600">
        {Object.entries(REGION_COLOR).map(([r, c]) => (
          <div key={r} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: c }} />{r}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tickFormatter={fmtMRR} tick={{ fontSize: 11, fill: "#64748b" }} width={64} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalACV" radius={[4, 4, 0, 0]}>
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
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">#</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">AE</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Region</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Deals</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Total ACV</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Avg ACV</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const pct = totalACV > 0 ? ((row.totalACV / totalACV) * 100).toFixed(1) : "0.0";
              return (
                <tr key={row.ownerId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{row.name}</td>
                  <td className="px-4 py-2.5">
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
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmtNumber(row.deals)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">{fmtMRR(row.totalACV)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmtMRR(row.avgACV)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-9 text-xs text-gray-500">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
