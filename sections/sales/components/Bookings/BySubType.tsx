"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import type { BookingsSubTypeRow } from "@/sections/sales/types";

const TYPE_COLOR: Record<string, string> = {
  Annual:    "#6366f1",
  Monthly:   "#06b6d4",
  Multiyear: "#10b981",
  Unknown:   "#cbd5e1",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { type, mrr, deals, pct } = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{type}</p>
      <p className="text-indigo-600">MRR: <span className="font-bold">{fmtMRR(mrr)}</span></p>
      <p className="text-gray-600">Deals: <span className="font-bold">{fmtNumber(deals)}</span></p>
      <p className="text-gray-600">Share: <span className="font-bold">{pct}%</span></p>
    </div>
  );
};

export default function BySubType({ data }: { data: BookingsSubTypeRow[] }) {
  return (
    <>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        {/* Donut chart */}
        <div className="w-full sm:w-64 flex-shrink-0">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="mrr"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={TYPE_COLOR[entry.type] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary table */}
        <div className="flex-1 w-full overflow-hidden rounded-lg border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-gray-500">Type</th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">Deals</th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">MRR</th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">Share</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.type} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ background: TYPE_COLOR[row.type] ?? "#94a3b8" }}
                      />
                      <span className="font-medium text-gray-800">{row.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmtNumber(row.deals)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">{fmtMRR(row.mrr)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${row.pct}%`,
                            background: TYPE_COLOR[row.type] ?? "#94a3b8",
                          }}
                        />
                      </div>
                      <span className="w-10 text-xs font-semibold text-gray-700">{row.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
