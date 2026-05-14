"use client";

// Renders a triangular cohort matrix — exactly mirrors the PDF layout.
// Cells are color-coded by retention rate (lower → red, higher → green)
// so the table reads like the source heatmap.

import type { CohortMatrix } from "../../types";

interface Props {
  matrix: CohortMatrix;
  /** "percent" formats cells as "84%". "currency" formats $K. "count" formats raw numbers. */
  format: "percent" | "currency" | "count";
  /** Unit for the Start column. Required for percent tables (no way to infer). Defaults to the cell format. */
  startUnit?: "currency" | "count";
}

function fmt(value: number | null | undefined, format: Props["format"]): string {
  if (value == null) return "";
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "currency") return `$${value.toLocaleString("en-US")}K`;
  return value.toLocaleString("en-US");
}

// Color scale anchored on retention rate (0–120%).
// We compute the implicit retention for each cell: percent table = the cell value,
// absolute table = cell / start * 100. Then map to a teal→amber palette.
function bgFor(retentionPct: number | null): string {
  if (retentionPct == null) return "";
  if (retentionPct >= 100) return "bg-emerald-100 text-emerald-900";
  if (retentionPct >= 90)  return "bg-emerald-50 text-emerald-800";
  if (retentionPct >= 80)  return "bg-teal-50 text-teal-800";
  if (retentionPct >= 70)  return "bg-amber-50 text-amber-800";
  if (retentionPct >= 60)  return "bg-orange-50 text-orange-800";
  if (retentionPct >= 50)  return "bg-orange-100 text-orange-900";
  if (retentionPct >= 40)  return "bg-rose-50 text-rose-800";
  return "bg-rose-100 text-rose-900";
}

export default function CohortMatrix({ matrix, format, startUnit }: Props) {
  const startFormat: "currency" | "count" =
    startUnit ?? (format === "percent" ? "currency" : (format as "currency" | "count"));
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 px-5 py-3">
        <h4 className="text-sm font-semibold text-gray-900">{matrix.title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-3 py-2 text-left font-medium text-gray-500">Month</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Start</th>
              {matrix.monthHeaders.map((h) => (
                <th key={h} className="px-3 py-2 text-right font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => {
              const startVal = row.start;
              return (
                <tr key={row.cohort} className="border-t border-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium text-gray-700">{row.cohort}</td>
                  <td className="px-3 py-1.5 text-right text-gray-500">
                    {startVal != null ? fmt(startVal, startFormat) : ""}
                  </td>
                  {matrix.monthHeaders.map((_, i) => {
                    const v = row.values[i];
                    const retention =
                      v == null
                        ? null
                        : format === "percent"
                          ? v
                          : startVal && startVal > 0
                            ? (v / startVal) * 100
                            : null;
                    return (
                      <td
                        key={i}
                        className={`px-3 py-1.5 text-right ${v == null ? "text-gray-300" : bgFor(retention)}`}
                      >
                        {fmt(v, format)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
