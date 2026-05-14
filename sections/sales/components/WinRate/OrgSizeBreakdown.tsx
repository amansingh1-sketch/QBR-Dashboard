"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import type { WinRateCohort } from "@/sections/sales/types";
import ThresholdLegend from "@/lib/shared/ui/ThresholdLegend";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const won = payload.find((p: any) => p.dataKey === "won")?.value ?? 0;
  const lost = payload.find((p: any) => p.dataKey === "lost")?.value ?? 0;
  const total = won + lost;
  const pct = total > 0 ? ((won / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-emerald-600">Won: <span className="font-bold">{fmtNumber(won)}</span></p>
      <p className="text-red-400">Lost: <span className="font-bold">{fmtNumber(lost)}</span></p>
      <p className="text-gray-700">Win rate: <span className="font-bold">{pct}%</span></p>
    </div>
  );
};

interface Props {
  cohort: WinRateCohort;
  label: string;
}

export default function OrgSizeBreakdown({ cohort, label }: Props) {
  const chartData = [
    { segment: "100+", won: cohort["100plus"].won, lost: cohort["100plus"].lost },
    { segment: "100-", won: cohort["100minus"].won, lost: cohort["100minus"].lost },
  ];

  const segments = [
    { key: "100+" as const, label: "100+ employees", data: cohort["100plus"] },
    { key: "100-" as const, label: "< 100 employees", data: cohort["100minus"] },
  ];

  return (
    <>
      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Overall Win Rate</p>
          <p className={`mt-1 text-3xl font-bold ${cohort.overall.winRate >= 50 ? "text-emerald-600" : cohort.overall.winRate >= 30 ? "text-amber-600" : "text-red-500"}`}>
            {cohort.overall.winRate}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{fmtNumber(cohort.overall.won)}W / {fmtNumber(cohort.overall.lost)}L of {fmtNumber(cohort.overall.total)}</p>
        </div>
        {segments.map(({ key, label: seg, data }) => (
          <div key={key} className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{seg}</p>
            <p className={`mt-1 text-2xl font-bold ${data.winRate >= 50 ? "text-emerald-600" : data.winRate >= 30 ? "text-amber-600" : "text-red-500"}`}>
              {data.winRate}%
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{fmtNumber(data.won)}W / {fmtNumber(data.lost)}L</p>
          </div>
        ))}
      </div>

      {/* Win rate threshold legend */}
      <div className="mb-2 flex justify-end">
        <ThresholdLegend
          metric="Win Rate"
          tiers={[
            { color: "emerald", label: "≥ 50%" },
            { color: "amber",   label: "30–49%" },
            { color: "red",     label: "< 30%" },
          ]}
        />
      </div>

      {/* Chart */}
      <div className="flex justify-center gap-5 pb-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-400" />Won</div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-red-300" />Lost</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="segment" tick={{ fontSize: 13, fill: "#64748b", fontWeight: 600 }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="won" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} />
          <Bar dataKey="lost" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Segment</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Won</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Lost</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Total</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Win Rate</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Won MRR</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "100+ employees", data: cohort["100plus"] },
              { label: "< 100 employees", data: cohort["100minus"] },
              { label: "Overall", data: cohort.overall },
            ].map(({ label: seg, data }, i) => (
              <tr key={seg} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-4 py-2.5 font-medium text-gray-800">{seg}</td>
                <td className="px-4 py-2.5 text-right text-emerald-600 font-semibold">{fmtNumber(data.won)}</td>
                <td className="px-4 py-2.5 text-right text-red-400">{fmtNumber(data.lost)}</td>
                <td className="px-4 py-2.5 text-right text-gray-600">{fmtNumber(data.total)}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${data.winRate}%` }} />
                    </div>
                    <span className={`w-11 text-xs font-semibold ${data.winRate >= 50 ? "text-emerald-600" : data.winRate >= 30 ? "text-amber-600" : "text-red-500"}`}>
                      {data.winRate}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">{fmtMRR(data.wonMrr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
