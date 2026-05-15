"use client";

import { useState } from "react";
import type { MrrChangeData, MrrChangeSegment, MrrChangeTable } from "../../types";

type Segment = "total" | "scaled" | "strategic";

const SEGMENT_LABELS: Record<Segment, string> = {
  total: "Total",
  scaled: "Scaled",
  strategic: "Strategic",
};

// ─────────────────────── Targets & Attainment ───────────────────────
// Expansion = Expansion + Reactivation (per business definition)
// Source: QBR spreadsheet targets (Q1/Q2 FY2026 columns from planning sheet)

interface SegmentTarget {
  expansion: number;
  downgrade: number;
  churn: number;
  net_new_mrr: number;
}

interface QuarterTargetDef {
  label: string;
  isQTD?: boolean;
  targets: SegmentTarget;
}

const QUARTER_TARGETS: Record<Segment, QuarterTargetDef[]> = {
  total: [
    {
      label: "Q1 FY2026",
      targets: { expansion: 406911, downgrade: -184973, churn: -234598, net_new_mrr: -12660 },
    },
    {
      label: "Q2 FY2026",
      isQTD: true,
      targets: { expansion: 475534, downgrade: -200610, churn: -254012, net_new_mrr: 20912 },
    },
  ],
  scaled: [
    {
      label: "Q1 FY2026",
      targets: { expansion: 79919, downgrade: -41616, churn: -107878, net_new_mrr: -69575 },
    },
    {
      label: "Q2 FY2026",
      isQTD: true,
      targets: { expansion: 116163, downgrade: -59657, churn: -134724, net_new_mrr: -78219 },
    },
  ],
  strategic: [
    {
      label: "Q1 FY2026",
      targets: { expansion: 326992, downgrade: -143357, churn: -126720, net_new_mrr: 56915 },
    },
    {
      label: "Q2 FY2026",
      isQTD: true,
      targets: { expansion: 359371, downgrade: -140953, churn: -119288, net_new_mrr: 99130 },
    },
  ],
};

function computeActuals(seg: MrrChangeSegment): SegmentTarget {
  const table = seg.total;
  if (!table) return { expansion: 0, downgrade: 0, churn: 0, net_new_mrr: 0 };
  const sumArr = (arr: (number | null)[] | undefined) =>
    (arr ?? []).reduce((s: number, v) => s + (Number(v) || 0), 0);
  return {
    expansion: sumArr(table.expansion) + sumArr(table.reactivation),
    downgrade: sumArr(table.downgrade),
    churn: sumArr(table.churn),
    net_new_mrr: sumArr(table.net_expansions),
  };
}

const TARGET_ROWS: { key: keyof SegmentTarget; label: string }[] = [
  { key: "expansion",   label: "Expansion (incl. Reactivation)" },
  { key: "downgrade",   label: "Downgrade"                      },
  { key: "churn",       label: "Churn"                          },
  { key: "net_new_mrr", label: "Net New MRR"                    },
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

function QuarterCard({ qt, actuals }: { qt: QuarterTargetDef; actuals: SegmentTarget }) {
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
            const actual   = actuals[row.key];
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

function TargetsAttainment({
  data, isQ2, segment, onSegmentChange,
}: {
  data: MrrChangeData;
  isQ2: boolean;
  segment: Segment;
  onSegmentChange: (s: Segment) => void;
}) {
  const quarterIdx = isQ2 ? 1 : 0;
  const qt = QUARTER_TARGETS[segment][quarterIdx];
  const actuals = computeActuals(data[segment]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-700">Targets & Attainment</h3>
        <p className="text-xs text-gray-400">Expansion includes Reactivation. Actuals = New + Existing (total cohort).</p>
      </div>
      <div className="inline-flex rounded-lg bg-gray-100 p-1">
        {(Object.keys(SEGMENT_LABELS) as Segment[]).map((s) => (
          <button
            key={s}
            onClick={() => onSegmentChange(s)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              segment === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {SEGMENT_LABELS[s]}
          </button>
        ))}
      </div>
      <QuarterCard qt={qt} actuals={actuals} />
    </div>
  );
}

// ─────────────────────── P&L table ───────────────────────

const ROW_DEFS: { key: keyof MrrChangeTable; label: string; isPct?: boolean; isNet?: boolean; isHeader?: boolean }[] = [
  { key: "starting_mrr",      label: "Starting MRR",                    isHeader: true },
  { key: "new",               label: "New"                                              },
  { key: "expansion",         label: "Expansion"                                        },
  { key: "downgrade",         label: "Downgrade"                                        },
  { key: "churn",             label: "Churn"                                            },
  { key: "reactivation",      label: "Reactivation"                                     },
  { key: "closing_mrr",       label: "Closing MRR",                     isHeader: true },
  { key: "net_expansions",    label: "Net Expansions",                   isNet:   true  },
  { key: "net_expansion_pct", label: "Net Expansion as % of start",      isPct:   true  },
  { key: "expansion_pct",     label: "Expansion as % of start",          isPct:   true  },
  { key: "downgrade_pct",     label: "Downgrade as % of start",          isPct:   true  },
  { key: "churn_pct",         label: "Churn as % of start",              isPct:   true  },
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
  expansion_pct:     "expansion",
  downgrade_pct:     "downgrade",
  churn_pct:         "churn",
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

function PnLTable({ table, title }: { table: MrrChangeTable | null; title: string }) {
  if (!table) {
    return <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-400">{title}: no data</div>;
  }
  const showTotal = table.months.length > 1;
  const sumVals = (vals: (number | null)[]) =>
    vals.reduce((s: number, v) => s + (Number(v) || 0), 0);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <div className="px-4 py-2 text-sm font-bold text-gray-800 bg-slate-50">{title}</div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500"></th>
            {table.months.map((m) => (
              <th key={m} className="px-4 py-2 text-center font-medium text-gray-500">{m}</th>
            ))}
            {showTotal && (
              <th className="px-4 py-2 text-center font-semibold text-gray-700 bg-gray-100/80">
                {table.months.length === 3 ? "Q Total" : "Period Total"}
              </th>
            )}
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
            const total = !rd.isPct && !rd.isHeader ? sumVals(vals) : null;
            return (
              <tr key={String(rd.key)} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className={`px-4 py-2 ${cls}`}>{rd.label}</td>
                {vals.map((v, j) => (
                  <td key={j} className={`px-4 py-2 text-center ${cls}`}>
                    {v == null ? "" : rd.isPct ? fmtPct(v) : fmtK(v)}
                  </td>
                ))}
                {showTotal && (
                  <td className={`px-4 py-2 text-center bg-gray-100/50 ${cls}`}>
                    {total != null ? fmtK(total) : ""}
                  </td>
                )}
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

      {/* Targets & Attainment — single segment switcher drives both this and the P&L tables */}
      <TargetsAttainment data={data} isQ2={isQ2} segment={segment} onSegmentChange={setSegment} />

      <hr className="border-gray-200" />

      {/* P&L tables — Total first, then New, then Existing */}
      <div className="space-y-5">
        <PnLTable table={seg.total}               title="Total"                             />
        <PnLTable table={seg.new_customers}       title="New customers post Feb 2026"       />
        <PnLTable table={seg.existing_customers}  title="Existing customers post Feb 2026"  />
      </div>
    </section>
  );
}
