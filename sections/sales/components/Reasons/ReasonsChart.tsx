"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import type { ReasonRow } from "@/sections/sales/types";

const COLORS = [
  "#6B8CAE", "#8B7FA8", "#06b6d4", "#5B9B8E",
  "#f59e0b", "#ef4444", "#ec4899", "#84cc16",
  "#f97316", "#14b8a6", "#a855f7", "#64748b",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{d?.reason}</p>
      <p className="text-slate-700">Deals: <span className="font-bold">{fmtNumber(d?.deals ?? 0)}</span> ({d?.pct}%)</p>
      <p className="text-gray-600">MRR: <span className="font-bold">{fmtMRR(d?.mrr ?? 0)}</span> ({d?.mrrPct}%)</p>
    </div>
  );
};

interface Props {
  data: ReasonRow[];
  accentColor: string;
}

export default function ReasonsChart({ data, accentColor }: Props) {
  // Truncate label for chart display
  const chartData = data.map((r) => ({
    ...r,
    shortLabel: r.reason.length > 20 ? r.reason.slice(0, 18) + "…" : r.reason,
  }));

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis
            type="category"
            dataKey="shortLabel"
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={140}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="deals" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Reason</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Deals</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">% Deals</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">MRR Impact</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">% MRR</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.reason} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-800">{row.reason}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right text-gray-600">{fmtNumber(row.deals)}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.pct}%`, background: accentColor }}
                      />
                    </div>
                    <span className="w-10 text-xs font-semibold text-gray-700">{row.pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{fmtMRR(row.mrr)}</td>
                <td className="px-4 py-2.5 text-right text-xs text-gray-500">{row.mrrPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
