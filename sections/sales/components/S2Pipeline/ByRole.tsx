"use client";

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
import type { RoleBreakdown } from "@/sections/sales/types";

const ROLE_COLORS: Record<string, string> = {
  SDR: "#6B8CAE",
  BDR: "#8B7FA8",
  PS: "#06b6d4",
  AE: "#f59e0b",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const mrr = payload.find((p: any) => p.dataKey === "mrr")?.value ?? 0;
  const deals = payload.find((p: any) => p.dataKey === "deals")?.value ?? 0;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p style={{ color: ROLE_COLORS[label] ?? "#6B8CAE" }}>
        MRR: <span className="font-bold">{fmtMRR(mrr)}</span>
      </p>
      <p className="text-gray-600">
        Deals: <span className="font-bold">{fmtNumber(deals)}</span>
      </p>
    </div>
  );
};

export default function ByRole({ data, selectedTypes }: { data: RoleBreakdown[]; selectedTypes: Set<DealTypeKey> }) {
  const filtered = data.map((r) => ({ ...r, ...applyDealTypeFilter(r, selectedTypes) }));
  const total = filtered.reduce((s, r) => s + r.mrr, 0);

  return (
    <>
      <div className="flex flex-wrap justify-end gap-x-4 gap-y-1 pb-2 text-xs text-gray-600">
        {Object.entries(ROLE_COLORS).map(([role, c]) => (
          <div key={role} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm" style={{ background: c }} />
            {role}
          </div>
        ))}
        <div className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 rounded bg-gray-400" style={{ verticalAlign: "middle" }} /><span className="inline-block h-2 w-2 -ml-1.5 rounded-full bg-gray-400" style={{ verticalAlign: "middle" }} /> Deals</div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={filtered} margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="role" tick={{ fontSize: 13, fill: "#64748b", fontWeight: 600 }} />
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
            {filtered.map((row) => (
              <Cell key={row.role} fill={ROLE_COLORS[row.role] ?? "#6B8CAE"} />
            ))}
          </Bar>
          <Line yAxisId="deals" type="monotone" dataKey="deals" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4, fill: "#94a3b8", strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Role summary table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500">Role</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Deals</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">MRR</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">Pipeline ACV</th>
              <th className="px-4 py-2 text-right font-medium text-gray-500">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const pct = total > 0 ? ((row.mrr / total) * 100).toFixed(1) : "0.0";
              return (
                <tr key={row.role} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ background: ROLE_COLORS[row.role] ?? "#6B8CAE" }}
                      />
                      <span className="font-medium text-gray-800">{row.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">{fmtNumber(row.deals)}</td>
                  <td className="px-4 py-2 text-right font-semibold text-slate-700">{fmtMRR(row.mrr)}</td>
                  <td className="px-4 py-2 text-right font-semibold text-slate-700">{fmtMRR(row.mrr * 12)}</td>
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
