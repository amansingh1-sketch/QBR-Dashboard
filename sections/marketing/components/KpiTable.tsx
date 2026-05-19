"use client";

// Shared KPI table renderer for the Marketing section.
// Renders the workbook's monthly columns (Nov/Dec/Jan + Q4 Total | Feb/Mar/Apr + Q1 Total).
// Null cells render as "—". Q-totals are visually emphasized.

import type { Cell, KpiTable as KpiTableData } from "../types";

interface Props {
  table: KpiTableData;
  /** Format hint — "number" (default), "currency" for USD values, or "raw" for percentages already formatted. */
  format?: "number" | "currency";
  /** Per-row override: return "currency" or "number" for a given metric name. Falls back to `format`. */
  rowFormat?: (metric: string) => "number" | "currency";
}

function fmt(value: Cell, format: "number" | "currency"): string {
  if (value === null || value === undefined) return "—";
  if (format === "currency") {
    if (value === 0) return "$0";
    if (value >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    return `$${value.toFixed(2)}`;
  }
  return new Intl.NumberFormat("en-US").format(value);
}

export default function KpiTable({ table, format = "number", rowFormat }: Props) {
  const hasGroup = table.rows.some((r) => r.group !== undefined);

  // Group rows by their `group` value so we can visually segment platforms/pages/channels.
  const groups: { name: string | undefined; rows: typeof table.rows }[] = [];
  for (const row of table.rows) {
    const last = groups[groups.length - 1];
    if (last && last.name === row.group) {
      last.rows.push(row);
    } else {
      groups.push({ name: row.group, rows: [row] });
    }
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="border-b border-gray-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{table.title}</h3>
        {table.subtitle && <p className="mt-0.5 text-xs text-gray-500">{table.subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              {hasGroup && (
                <th className="px-3 py-2 text-left font-medium text-gray-500">
                  {table.groupHeader ?? ""}
                </th>
              )}
              <th className="px-3 py-2 text-left font-medium text-gray-500">Metric</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Nov</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Dec</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Jan</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-700 bg-slate-100/40">Q4 Total</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Feb</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Mar</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Apr</th>
              <th className="px-3 py-2 text-right font-semibold text-violet-600 bg-violet-50/40">Q1 Total</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g, gi) => (
              g.rows.map((row, ri) => {
                const isFirstOfGroup = ri === 0;
                const cellFmt = rowFormat?.(row.metric) ?? format;
                return (
                  <tr
                    key={`${gi}-${ri}`}
                    className={`border-t border-gray-50 ${ri === 0 && gi > 0 ? "border-t-gray-200" : ""}`}
                  >
                    {hasGroup && (
                      <td className="px-3 py-1.5 align-top font-medium text-gray-700">
                        {isFirstOfGroup ? g.name ?? "" : ""}
                      </td>
                    )}
                    <td className="px-3 py-1.5 text-gray-800">{row.metric}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{fmt(row.nov, cellFmt)}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{fmt(row.dec, cellFmt)}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{fmt(row.jan, cellFmt)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-slate-700 bg-slate-100/40">
                      {fmt(row.q4Total, cellFmt)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{fmt(row.feb, cellFmt)}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{fmt(row.mar, cellFmt)}</td>
                    <td className="px-3 py-1.5 text-right text-gray-600">{fmt(row.apr, cellFmt)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-violet-700 bg-violet-50/40">
                      {fmt(row.q1Total, cellFmt)}
                    </td>
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
