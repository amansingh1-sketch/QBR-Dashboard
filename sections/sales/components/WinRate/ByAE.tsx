"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import type { WinRateAERow } from "@/sections/sales/types";
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

export default function ByAE({ data, showS1Conv = false, showOpen = false }: { data: WinRateAERow[]; showS1Conv?: boolean; showOpen?: boolean }) {
  // Filter to meaningful AEs (≥5 deals) and sort by total deals
  const filtered = data.filter((r) => r.total >= 5).sort((a, b) => b.total - a.total);

  const chartData = filtered.map((r) => ({
    name: r.name.split(" ")[0],
    won: r.won,
    lost: r.lost,
    winRate: r.winRate,
  }));

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-end gap-x-5 gap-y-1">
        <ThresholdLegend
          metric="Win Rate"
          tiers={[
            { color: "emerald", label: "≥ 50%" },
            { color: "amber",   label: "30–49%" },
            { color: "red",     label: "< 30%" },
          ]}
        />
        {showS1Conv && (
          <ThresholdLegend
            metric="S1→S2%"
            tiers={[
              { color: "emerald", label: "≥ 60%" },
              { color: "amber",   label: "40–59%" },
              { color: "red",     label: "< 40%" },
            ]}
          />
        )}
      </div>
      <div className="flex justify-center gap-5 pb-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-400" />Won</div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-red-300" />Lost</div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 8, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={36} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="won" stackId="a" fill="#34d399" />
          <Bar dataKey="lost" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">#</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">AE</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Won</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Lost</th>
              {showOpen && <th className="px-4 py-2.5 text-right font-medium text-gray-500">Open</th>}
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Total</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Win Rate</th>
              {showS1Conv && (
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">S1→S2%</th>
              )}
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Won MRR</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.ownerId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                <td className="px-4 py-2.5 font-medium text-gray-800">{row.name}</td>
                <td className="px-4 py-2.5 text-right text-emerald-600 font-semibold">{fmtNumber(row.won)}</td>
                <td className="px-4 py-2.5 text-right text-red-400">{fmtNumber(row.lost)}</td>
                {showOpen && <td className="px-4 py-2.5 text-right text-gray-500">{fmtNumber(row.open ?? 0)}</td>}
                <td className="px-4 py-2.5 text-right text-gray-600">{fmtNumber(row.total)}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${row.winRate}%` }} />
                    </div>
                    <span className={`w-11 text-xs font-semibold ${row.winRate >= 50 ? "text-emerald-600" : row.winRate >= 30 ? "text-amber-600" : "text-red-500"}`}>
                      {row.winRate}%
                    </span>
                  </div>
                </td>
                {showS1Conv && (
                  <td className="px-4 py-2.5 text-right">
                    {row.s1Deals !== undefined && row.s1Deals > 0 ? (
                      <span className={`text-xs font-semibold ${(row.s1ToS2Pct ?? 0) >= 60 ? "text-emerald-600" : (row.s1ToS2Pct ?? 0) >= 40 ? "text-amber-600" : "text-red-500"}`}>
                        {row.s1ToS2Pct}%
                        <span className="ml-1 text-gray-400 font-normal">({row.s1Deals})</span>
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">{fmtMRR(row.wonMrr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
