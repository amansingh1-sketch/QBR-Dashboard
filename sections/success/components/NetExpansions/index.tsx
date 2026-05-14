"use client";

import { useState } from "react";
import type { MrrChangeData, MrrChangeSegment, MrrChangeTable } from "../../types";

type Segment = "total" | "scaled" | "strategic";
type Cohort = "existing_customers" | "new_customers";

const SEGMENT_LABELS: Record<Segment, string> = {
  total: "Total",
  scaled: "Scaled",
  strategic: "Strategic",
};

const ROW_DEFS: { key: keyof MrrChangeTable; label: string; isPct?: boolean; isNet?: boolean; isHeader?: boolean }[] = [
  { key: "starting_mrr", label: "Starting MRR", isHeader: true },
  { key: "new", label: "New" },
  { key: "expansion", label: "Expansion" },
  { key: "downgrade", label: "Downgrade" },
  { key: "churn", label: "Churn" },
  { key: "reactivation", label: "Reactivation" },
  { key: "closing_mrr", label: "Closing MRR", isHeader: true },
  { key: "net_expansions", label: "Net Expansions", isNet: true },
  { key: "net_expansion_pct", label: "Net Expansion as % of start", isPct: true },
  { key: "expansion_pct", label: "Expansion as % of start", isPct: true },
  { key: "downgrade_pct", label: "Downgrade as % of start", isPct: true },
  { key: "churn_pct", label: "Churn as % of start", isPct: true },
];

function fmtK(n: number): string {
  if (!isFinite(n)) return "$0K";
  const sign = n < 0 ? "-" : "";
  const k = Math.abs(n) / 1000;
  return `${sign}$${k >= 1000 ? Math.round(k).toLocaleString() : k.toFixed(1)}K`;
}

function fmtPct(v: number | null | undefined) {
  if (v == null) return "";
  return (v * 100).toFixed(1) + "%";
}

// For % rows, the xlsx only stores a value for the first month. Derive across all months
// from the underlying numerator (expansion/downgrade/churn/net_expansions) ÷ starting_mrr.
const PCT_NUMERATOR: Partial<Record<keyof MrrChangeTable, keyof MrrChangeTable>> = {
  net_expansion_pct: "net_expansions",
  expansion_pct: "expansion",
  downgrade_pct: "downgrade",
  churn_pct: "churn",
};

function derivePctValues(table: MrrChangeTable, key: keyof MrrChangeTable): (number | null)[] {
  const stored = (table[key] as (number | null)[] | undefined) ?? [];
  const numKey = PCT_NUMERATOR[key];
  if (!numKey) return stored;
  const num = (table[numKey] as (number | null)[] | undefined) ?? [];
  const den = (table.starting_mrr ?? []) as (number | null)[];
  return table.months.map((_, i) => {
    if (stored[i] != null) return stored[i]; // honor the value provided in the xlsx
    const n = num[i];
    const d = den[i];
    if (n == null || d == null || d === 0) return null;
    return n / d;
  });
}

function PnLTable({ table, title, accent }: { table: MrrChangeTable | null; title: string; accent: "blue" | "green" }) {
  if (!table) {
    return <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-400">{title}: no data</div>;
  }
  const headerBg = accent === "blue" ? "bg-blue-50" : "bg-emerald-50";
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <div className={`px-4 py-2 text-sm font-bold text-gray-800 ${headerBg}`}>{title}</div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500"></th>
            {table.months.map((m) => (
              <th key={m} className="px-4 py-2 text-right font-medium text-gray-500">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROW_DEFS.map((rd, i) => {
            const vals = rd.isPct
              ? derivePctValues(table, rd.key)
              : ((table[rd.key] as (number | null)[] | undefined) ?? []);
            const empty = !vals.some((v) => v != null);
            if (empty) return null;
            const cls = rd.isHeader
              ? "font-semibold text-gray-900"
              : rd.isNet
                ? "font-semibold text-gray-700"
                : rd.isPct
                  ? "italic text-gray-500"
                  : "text-gray-600";
            return (
              <tr key={String(rd.key)} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className={`px-4 py-2 ${cls}`}>{rd.label}</td>
                {vals.map((v, j) => (
                  <td key={j} className={`px-4 py-2 text-right ${cls}`}>
                    {v == null ? "" : rd.isPct ? fmtPct(v) : fmtK(v)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface Props {
  data: MrrChangeData;
}

export default function NetExpansions({ data }: Props) {
  const [segment, setSegment] = useState<Segment>("total");
  const seg: MrrChangeSegment = data[segment];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Net Expansions</h2>
        <p className="text-sm text-gray-500">MRR change by month — Q1 FY2026 (Feb–Apr 2026).</p>
      </div>

      {/* Segment switcher */}
      <div className="inline-flex rounded-lg bg-gray-100 p-1">
        {(Object.keys(SEGMENT_LABELS) as Segment[]).map((s) => (
          <button
            key={s}
            onClick={() => setSegment(s)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              segment === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {SEGMENT_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <PnLTable table={seg.existing_customers} title="Existing customers post Feb 2026" accent="green" />
        <PnLTable table={seg.new_customers} title="New customers post Feb 2026" accent="blue" />
        <PnLTable table={seg.total} title="Total" accent="green" />
      </div>
    </section>
  );
}
