"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import { applyDealTypeFilter, type DealTypeKey } from "@/sections/sales/components/DealTypeFilter";
import type { RepBreakdown } from "@/sections/sales/types";

const ROLE_COLORS: Record<string, string> = {
  SDR: "#6366f1",
  BDR: "#8b5cf6",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const mrr = payload.find((p: any) => p.dataKey === "mrr")?.value ?? 0;
  const deals = payload.find((p: any) => p.dataKey === "deals")?.value ?? 0;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-indigo-600">MRR: <span className="font-bold">{fmtMRR(mrr)}</span></p>
      <p className="text-gray-600">Deals: <span className="font-bold">{fmtNumber(deals)}</span></p>
    </div>
  );
};

const ROLE_BADGE: Record<string, string> = {
  SDR: "bg-indigo-100 text-indigo-700",
  BDR: "bg-violet-100 text-violet-700",
};

type SortKey = "mrr" | "deals" | "name";

export default function SdrBdrDeepDive({ data, selectedTypes }: { data: RepBreakdown[]; selectedTypes: Set<DealTypeKey> }) {
  const [sortKey, setSortKey] = useState<SortKey>("mrr");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "SDR" | "BDR">("ALL");

  const enriched = data.map((r) => ({ ...r, ...applyDealTypeFilter(r, selectedTypes) }));
  const filtered = enriched.filter((r) => roleFilter === "ALL" || r.role === roleFilter);
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === "mrr") return b.mrr - a.mrr;
    if (sortKey === "deals") return b.deals - a.deals;
    return a.name.localeCompare(b.name);
  });

  const totalDeals = filtered.reduce((s, r) => s + r.deals, 0);
  const totalMRR = filtered.reduce((s, r) => s + r.mrr, 0);

  return (
    <>
      {/* Rep MRR bar + deals line chart */}
      <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 pb-2 text-xs text-gray-600">
        {Object.entries(ROLE_COLORS).map(([role, c]) => (
          <div key={role} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: c }} />
            {role}
          </div>
        ))}
        <div className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-gray-400" style={{ verticalAlign: "middle" }} /><span className="inline-block h-2 w-2 -ml-1.5 rounded-full bg-gray-400" style={{ verticalAlign: "middle" }} /> Deals</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={sorted} margin={{ top: 4, right: 40, left: 8, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            yAxisId="mrr"
            orientation="left"
            tickFormatter={fmtMRR}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={60}
          />
          <YAxis
            yAxisId="deals"
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar yAxisId="mrr" dataKey="mrr" name="MRR" radius={[4, 4, 0, 0]}>
            {sorted.map((rep) => (
              <Cell key={rep.ownerId} fill={ROLE_COLORS[rep.role] ?? "#6366f1"} />
            ))}
          </Bar>
          <Line yAxisId="deals" type="monotone" dataKey="deals" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4, fill: "#94a3b8", strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Filters */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1.5 rounded-lg bg-gray-100 p-1">
          {(["ALL", "SDR", "BDR"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                roleFilter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          Sort:
          {(["mrr", "deals", "name"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`rounded px-2 py-0.5 capitalize transition-colors ${
                sortKey === k ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-gray-100"
              }`}
            >
              {k === "mrr" ? "MRR" : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No data for selected filter.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-gray-500">#</th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-500">Rep</th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">S2 Deals</th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">MRR Pipeline</th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">Avg Deal</th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((rep, i) => {
                const avg = rep.deals > 0 ? rep.mrr / rep.deals : 0;
                const pct = totalMRR > 0 ? ((rep.mrr / totalMRR) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={rep.ownerId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{rep.name}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          ROLE_BADGE[rep.role] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {rep.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{fmtNumber(rep.deals)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">
                      {fmtMRR(rep.mrr)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{fmtMRR(avg)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-indigo-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-xs text-gray-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-gray-600">
                  Total ({filtered.length} reps)
                </td>
                <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">
                  {fmtNumber(totalDeals)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs font-bold text-indigo-600">
                  {fmtMRR(totalMRR)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs text-gray-500">
                  {fmtMRR(totalDeals > 0 ? totalMRR / totalDeals : 0)}
                </td>
                <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
