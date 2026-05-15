"use client";

import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import type { S1S2Row } from "@/sections/sales/types";
import ThresholdLegend from "@/lib/shared/ui/ThresholdLegend";

const ROLE_BADGE: Record<string, string> = {
  SDR: "bg-indigo-100 text-indigo-700",
  BDR: "bg-violet-100 text-violet-700",
};

interface Props {
  rows: S1S2Row[];
  showRole?: boolean;
}

export default function ConversionTable({ rows, showRole = false }: Props) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-end">
        <ThresholdLegend
          metric="S1→S2%"
          tiers={[
            { color: "emerald", label: "≥ 60%" },
            { color: "amber",   label: "40–59%" },
            { color: "red",     label: "< 40%" },
          ]}
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2.5 text-left font-medium text-gray-500">#</th>
            <th className="px-4 py-2.5 text-left font-medium text-gray-500">Name</th>
            {showRole && <th className="px-4 py-2.5 text-left font-medium text-gray-500">Role</th>}
            <th className="px-4 py-2.5 text-right font-medium text-gray-500">S1 Deals</th>
            <th className="px-4 py-2.5 text-right font-medium text-gray-500">S2 Deals</th>
            <th className="px-4 py-2.5 text-right font-medium text-gray-500">S1→S2%</th>
            <th className="px-4 py-2.5 text-right font-medium text-gray-500">S2 MRR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.ownerId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
              <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
              <td className="px-4 py-2.5 font-medium text-gray-800">{row.name}</td>
              {showRole && (
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE[row.role ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                    {row.role}
                  </span>
                </td>
              )}
              <td className="px-4 py-2.5 text-right text-gray-600">{fmtNumber(row.s1Deals)}</td>
              <td className="px-4 py-2.5 text-right text-gray-600">{fmtNumber(row.s2Deals)}</td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${row.conversionPct}%` }}
                    />
                  </div>
                  <span className={`w-11 text-xs font-semibold ${row.conversionPct >= 60 ? "text-teal-700" : row.conversionPct >= 40 ? "text-amber-700" : "text-red-600"}`}>
                    {row.conversionPct}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-slate-700">{fmtMRR(row.s2Mrr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
