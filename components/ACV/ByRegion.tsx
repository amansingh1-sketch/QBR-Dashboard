"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import { fmtMRR, fmtNumber } from "@/lib/format";
import type { ACVRegionRow } from "@/lib/types";

type Cohort = "overall" | "100plus" | "100minus";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{fmtMRR(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

function getBucket(row: ACVRegionRow, cohort: Cohort) {
  return cohort === "overall" ? row.overall : row[cohort];
}

export default function ByRegion({ data, cohort }: { data: ACVRegionRow[]; cohort: Cohort }) {
  const chartData = data.map((r) => {
    const b = getBucket(r, cohort);
    return { region: r.region, avgACV: b.avgACV, totalACV: b.totalACV, deals: b.deals };
  });

  const totalACV = chartData.reduce((s, r) => s + r.totalACV, 0);

  return (
    <>
      <div className="flex justify-end gap-5 pb-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-indigo-400" />Total ACV</div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="region" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis tickFormatter={fmtMRR} tick={{ fontSize: 11, fill: "#64748b" }} width={64} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalACV" name="Total ACV" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Region</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Deals</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Total ACV</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Avg ACV</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, i) => {
              const pct = totalACV > 0 ? ((row.totalACV / totalACV) * 100).toFixed(1) : "0.0";
              return (
                <tr key={row.region} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2 font-medium text-gray-800">{row.region}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{fmtNumber(row.deals)}</td>
                  <td className="px-4 py-2 text-right font-semibold text-indigo-600">{fmtMRR(row.totalACV)}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{fmtMRR(row.avgACV)}</td>
                  <td className="px-4 py-2 text-right">
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
