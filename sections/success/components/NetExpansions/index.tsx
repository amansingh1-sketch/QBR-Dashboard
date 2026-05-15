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

// ─────────────────────── Targets & Attainment ───────────────────────
// Expansion = Expansion + Reactivation (per business definition)
// Source: QBR spreadsheet targets

interface QuarterTarget {
  label: string;
  isQTD?: boolean;
  actuals: { expansion: number; downgrade: number; churn: number; net_new_mrr: number };
  targets: { expansion: number; downgrade: number; churn: number; net_new_mrr: number };
}

const TARGETS: QuarterTarget[] = [
  {
    label: "Q1 FY2026",
    actuals:  { expansion: 296306,  downgrade: -127132, churn: -191901, net_new_mrr: -22726 },
    targets:  { expansion: 406911,  downgrade: -184974, churn: -234598, net_new_mrr: -12661 },
  },
  {
    label: "Q2 FY2026",
    isQTD: true,
    actuals:  { expansion: 58276,   downgrade: -37989,  churn: -33331,  net_new_mrr: -13044 },
    targets:  { expansion: 475533,  downgrade: -200611, churn: -254012, net_new_mrr:  20910 },
  },
];

const TARGET_ROWS: { key: keyof QuarterTarget["actuals"]; label: string; higherIsBetter: boolean }[] = [
  { key: "expansion",    label: "Expansion (incl. Reactivation)", higherIsBetter: true  },
  { key: "downgrade",    label: "Downgrade",                       higherIsBetter: false },
  { key: "churn",        label: "Churn",                           higherIsBetter: false },
  { key: "net_new_mrr",  label: "Net New MRR",                     higherIsBetter: true  },
];

function fmtDollar(n: number): string {
  if (!isFinite(n)) return "$0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs}`;
}

function fmtVariance(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${fmtDollar(v)}`;
}


function QuarterCard({ qt }: { qt: QuarterTarget }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <span className="text-sm font-bold text-gray-800">{qt.label}</span>
        {qt.isQTD && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            QTD — targets are full-quarter
          </span>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Metric</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">Actual</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">Target</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">vs Target</th>
          </tr>
        </thead>
        <tbody>
          {TARGET_ROWS.map((row, i) => {
            const actual   = qt.actuals[row.key];
            const target   = qt.targets[row.key];
            const variance = actual - target;
            const isGood   = variance >= 0;
            const isNetRow = row.key === "net_new_mrr";

            return (
              <tr
                key={row.key}
                className={`border-b border-gray-50 last:border-0 ${
                  isNetRow ? "bg-gray-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                <td className={`px-4 py-2.5 font-medium ${isNetRow ? "font-bold text-gray-800" : "text-gray-700"}`}>
                  {row.label}
                </td>
                <td className={`px-4 py-2.5 text-center font-semibold ${isGood ? "text-teal-800" : "text-red-600"}`}>
                  {fmtDollar(actual)}
                </td>
                <td className="px-4 py-2.5 text-center text-gray-500">
                  {fmtDollar(target)}
                </td>
                <td className={`px-4 py-2.5 text-center font-semibold ${isGood ? "text-teal-700" : "text-red-600"}`}>
                  {fmtVariance(variance)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TargetsAttainment({ isQ2 }: { isQ2: boolean }) {
  const qt = isQ2 ? TARGETS[1] : TARGETS[0];
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-700">Targets & Attainment</h3>
        <p className="text-xs text-gray-400">Expansion includes Reactivation.</p>
      </div>
      <QuarterCard qt={qt} />
    </div>
  );
}

// ─────────────────────── P&L table (unchanged) ───────────────────────

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
    if (stored[i] != null) return stored[i];
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
  const headerBg = accent === "blue" ? "bg-slate-50" : "bg-slate-50";
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <div className={`px-4 py-2 text-sm font-bold text-gray-800 ${headerBg}`}>{title}</div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500"></th>
            {table.months.map((m) => (
              <th key={m} className="px-4 py-2 text-center font-medium text-gray-500">{m}</th>
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
                  <td key={j} className={`px-4 py-2 text-center ${cls}`}>
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

// ─────────────────────── Main component ───────────────────────

interface Props {
  data: MrrChangeData;
}

function getPeriodLabel(data: MrrChangeData): string {
  const months = data.total?.total?.months ?? data.total?.existing_customers?.months ?? [];
  if (months.length === 1) return `${months[0]} (MTD)`;
  if (months.length > 1) return `${months[0]} – ${months[months.length - 1]}`;
  return "MRR change by month";
}

function isQ2Data(data: MrrChangeData): boolean {
  const months = data.total?.total?.months ?? data.total?.existing_customers?.months ?? [];
  return months.some((m) => m.includes("May"));
}

export default function NetExpansions({ data }: Props) {
  const [segment, setSegment] = useState<Segment>("total");
  const seg: MrrChangeSegment = data[segment];
  const periodLabel = getPeriodLabel(data);
  const isQ2 = isQ2Data(data);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Net Expansions</h2>
        <p className="text-sm text-gray-500">MRR change by month — {periodLabel}.</p>
      </div>

      {/* Targets & Attainment — quarter-matched */}
      <TargetsAttainment isQ2={isQ2} />

      <hr className="border-gray-200" />

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
