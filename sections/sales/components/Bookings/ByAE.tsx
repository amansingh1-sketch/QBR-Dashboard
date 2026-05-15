"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import { applyDealTypeFilter, type DealTypeKey } from "@/sections/sales/components/DealTypeFilter";
import type { BookingsAERow } from "@/sections/sales/types";

const REGION_COLOR: Record<string, string> = {
  NAMER: "#6B8CAE",
  EMEA:  "#5B9B8E",
  APAC:  "#f59e0b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const mrr   = payload[0]?.value ?? 0;
  const deals = payload[0]?.payload?.deals ?? 0;
  const region = payload[0]?.payload?.region ?? "";
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-xs text-gray-400 mb-1">{region}</p>
      <p className="text-slate-700">MRR: <span className="font-bold">{fmtMRR(mrr)}</span></p>
      <p className="text-gray-600">Deals: <span className="font-bold">{fmtNumber(deals)}</span></p>
    </div>
  );
};

export default function ByAE({ data, selectedTypes }: { data: BookingsAERow[]; selectedTypes: Set<DealTypeKey> }) {
  // Only show Active AEs (per Q1 FY27 roster)
  const activeOnly = data.filter((r) => r.isActive);
  const filtered = activeOnly.map((r) => {
    const f = applyDealTypeFilter(r, selectedTypes);
    const mrrQuotaPct = r.mrrQuota > 0 ? Math.round((f.mrr / r.mrrQuota) * 1000) / 10 : 0;
    return { ...r, ...f, mrrQuotaPct };
  });
  const total = filtered.reduce((s, r) => s + r.mrr, 0);
  const showQuota = selectedTypes.size === 3; // only meaningful when all deal types selected
  const chartData = filtered.map((r) => ({
    name: r.name.split(" ")[0],
    mrr: r.mrr,
    deals: r.deals,
    region: r.region,
    fullName: r.name,
  }));

  return (
    <>
      <div className="flex justify-end gap-4 pb-2 text-xs text-gray-600">
        {Object.entries(REGION_COLOR).map(([r, c]) => (
          <div key={r} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: c }} />
            {r}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tickFormatter={fmtMRR} tick={{ fontSize: 11, fill: "#64748b" }} width={64} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
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
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">MRR</th>
              {showQuota && (
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">MRR Quota</th>
              )}
              {showQuota && (
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">Quota %</th>
              )}
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Avg Deal</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const pct = total > 0 ? ((row.mrr / total) * 100).toFixed(1) : "0.0";
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
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{fmtMRR(row.mrr)}</td>
                  {showQuota && (
                    <td className="px-4 py-2.5 text-right text-gray-500">
                      {row.mrrQuota > 0 ? fmtMRR(row.mrrQuota) : <span className="text-gray-300">—</span>}
                    </td>
                  )}
                  {showQuota && (
                    <td className="px-4 py-2.5 text-right">
                      {row.mrrQuota > 0 ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${row.mrrQuotaPct >= 100 ? "bg-teal-500" : row.mrrQuotaPct >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(row.mrrQuotaPct, 100)}%` }}
                            />
                          </div>
                          <span className={`w-12 text-xs font-semibold ${row.mrrQuotaPct >= 100 ? "text-teal-700" : row.mrrQuotaPct >= 70 ? "text-amber-700" : "text-red-600"}`}>
                            {row.mrrQuotaPct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    {fmtMRR(row.deals > 0 ? row.mrr / row.deals : 0)}
                  </td>
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
