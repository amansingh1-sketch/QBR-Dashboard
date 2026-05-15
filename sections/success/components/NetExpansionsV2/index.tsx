"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer, LabelList } from "recharts";
import StatCard from "@/lib/shared/ui/StatCard";
import { fmtMRR } from "@/lib/shared/format";
import type { MrrChangeData, MrrChangeTable } from "../../types";

type Segment = "total" | "scaled" | "strategic";
type Cohort = "existing_customers" | "new_customers" | "total";

const SEGMENT_LABELS: Record<Segment, string> = {
  total: "Total",
  scaled: "Scaled",
  strategic: "Strategic",
};
const COHORT_LABELS: Record<Cohort, string> = {
  existing_customers: "Existing customers",
  new_customers: "New customers",
  total: "Total customer base",
};

// ---------- Waterfall data builder ----------
// For one month, we build steps: Starting → +Expansion → +Reactivation → −Downgrade → −Churn → +New → Closing.
// Recharts trick: each step is a bar made of [invisible offset] + [visible delta].
interface WaterfallStep {
  name: string;
  base: number;       // invisible portion (offset from x-axis)
  delta: number;      // visible portion (absolute height)
  signed: number;     // signed delta for label rendering
  kind: "anchor" | "positive" | "negative";
}

function buildWaterfall(table: MrrChangeTable, monthIdx: number): WaterfallStep[] {
  const get = (k: keyof MrrChangeTable) => {
    const arr = table[k] as (number | null)[] | undefined;
    return Number(arr?.[monthIdx] ?? 0);
  };
  const start = get("starting_mrr");
  const newC = get("new");
  const exp = get("expansion");
  const dgr = get("downgrade"); // already negative
  const chu = get("churn");     // already negative
  const rea = get("reactivation");
  const close = get("closing_mrr");

  const steps: WaterfallStep[] = [];
  steps.push({ name: "Starting MRR", base: 0, delta: start, signed: start, kind: "anchor" });

  let running = start;
  const push = (name: string, value: number) => {
    if (value === 0) return;
    if (value > 0) {
      steps.push({ name, base: running, delta: value, signed: value, kind: "positive" });
      running += value;
    } else {
      const v = Math.abs(value);
      running += value; // value is negative
      steps.push({ name, base: running, delta: v, signed: value, kind: "negative" });
    }
  };
  push("New", newC);
  push("Expansion", exp);
  push("Reactivation", rea);
  push("Downgrade", dgr);
  push("Churn", chu);

  steps.push({ name: "Closing MRR", base: 0, delta: close, signed: close, kind: "anchor" });
  return steps;
}

const STEP_COLOR = {
  anchor:   "#475569", // slate-600
  positive: "#5B9B8E", // muted teal
  negative: "#ef4444", // red-500
};

function fmtSigned(n: number): string {
  if (!isFinite(n) || n === 0) return "$0";
  const sign = n > 0 ? "+" : "−";
  return `${sign}${fmtMRR(Math.abs(n))}`;
}

const WaterfallTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as WaterfallStep | undefined;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800">{d.name}</p>
      <p className={d.kind === "negative" ? "text-red-600" : d.kind === "positive" ? "text-teal-700" : "text-gray-700"}>
        {d.kind === "anchor" ? fmtMRR(d.signed) : fmtSigned(d.signed)}
      </p>
    </div>
  );
};

// ---------- Compact monthly detail table ----------
const ROW_DEFS: { key: keyof MrrChangeTable; label: string; tone?: "in" | "out"; isHeader?: boolean; isNet?: boolean }[] = [
  { key: "starting_mrr", label: "Starting MRR", isHeader: true },
  { key: "new",          label: "New",          tone: "in"  },
  { key: "expansion",    label: "Expansion",    tone: "in"  },
  { key: "reactivation", label: "Reactivation", tone: "in"  },
  { key: "downgrade",    label: "Downgrade",    tone: "out" },
  { key: "churn",        label: "Churn",        tone: "out" },
  { key: "closing_mrr",  label: "Closing MRR",  isHeader: true },
  { key: "net_expansions", label: "Net Expansion", isNet: true },
];

function CompactTable({ table }: { table: MrrChangeTable }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-500"></th>
            {table.months.map((m) => (
              <th key={m} className="px-3 py-2 text-center font-medium text-gray-500">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROW_DEFS.map((rd) => {
            const vals = (table[rd.key] as (number | null)[] | undefined) ?? [];
            if (!vals.some((v) => v != null)) return null;
            const cls = rd.isHeader
              ? "font-bold text-gray-900 bg-gray-50/50"
              : rd.isNet
                ? "font-semibold border-t border-gray-200"
                : "text-gray-700";
            return (
              <tr key={String(rd.key)} className={cls}>
                <td className="px-3 py-2">{rd.label}</td>
                {vals.map((v, j) => (
                  <td key={j} className={`px-3 py-2 text-center ${
                    rd.tone === "in"  ? "text-teal-700" :
                    rd.tone === "out" ? "text-red-600" :
                    rd.isNet ? (Number(v ?? 0) >= 0 ? "text-teal-700" : "text-red-600") : ""
                  }`}>
                    {v == null ? "" : rd.tone || rd.isNet ? fmtSigned(Number(v)) : fmtMRR(Number(v))}
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

// ---------- Main component ----------
export default function NetExpansionsV2({ data }: { data: MrrChangeData }) {
  const [segment, setSegment] = useState<Segment>("total");
  const [cohort, setCohort] = useState<Cohort>("existing_customers");
  const segData = data[segment];
  const table = segData[cohort];

  if (!table || !table.months.length) {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Net Expansions</h2>
          <p className="text-sm text-gray-500">No data available for this view.</p>
        </div>
      </section>
    );
  }

  const months = table.months;
  // Default waterfall to the last month with non-null data.
  const defaultIdx = useMemo(() => {
    const closing = (table.closing_mrr ?? []) as (number | null)[];
    for (let i = closing.length - 1; i >= 0; i--) if (closing[i] != null) return i;
    return Math.max(0, months.length - 1);
  }, [table, months.length]);
  const [waterfallIdx, setWaterfallIdx] = useState<number>(defaultIdx);

  // Q1 KPIs (Q1 = Feb + Mar + Apr by convention).
  const sum = (arr: (number | null)[] | undefined) => (arr ?? []).slice(0, 3).reduce((s: number, n) => s + (Number(n) || 0), 0);
  const q1Net = sum(table.net_expansions);
  const startingQ1 = Number((table.starting_mrr ?? [])[0] ?? 0);
  const q1NetPct = startingQ1 ? (q1Net / startingQ1) * 100 : 0;
  // Latest closing MRR
  const latestClosing = (() => {
    const arr = (table.closing_mrr ?? []) as (number | null)[];
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return { val: Number(arr[i]), label: months[i] };
    return { val: 0, label: months[months.length - 1] ?? "" };
  })();

  const waterfall = useMemo(() => buildWaterfall(table, waterfallIdx), [table, waterfallIdx]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Net Expansions</h2>
        <p className="text-sm text-gray-500">MRR movement Q1 FY2026 (Feb–Apr 2026).</p>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {(Object.keys(SEGMENT_LABELS) as Segment[]).map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                segment === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {SEGMENT_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          {(Object.keys(COHORT_LABELS) as Cohort[]).map((c) => (
            <button
              key={c}
              onClick={() => setCohort(c)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                cohort === c ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {COHORT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Net Expansion (Q1)"
          value={fmtSigned(q1Net)}
          sub="Q1 FY2026: Feb + Mar + Apr"
          accent={q1Net >= 0 ? "emerald" : "indigo"}
        />
        <StatCard
          label="Net Expansion %"
          value={`${q1NetPct >= 0 ? "+" : ""}${q1NetPct.toFixed(2)}%`}
          sub="vs starting Feb MRR"
          accent={q1NetPct >= 0 ? "emerald" : "indigo"}
        />
        <StatCard
          label={`Closing MRR (${latestClosing.label})`}
          value={fmtMRR(latestClosing.val)}
          sub="Most recent month"
          accent="indigo"
        />
      </div>

      {/* Waterfall */}
      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">MRR movement waterfall</p>
          <div className="inline-flex rounded-md bg-gray-100 p-0.5 text-xs">
            {months.map((m, i) => (
              <button
                key={m}
                onClick={() => setWaterfallIdx(i)}
                className={`rounded px-2 py-1 font-medium transition-colors ${
                  waterfallIdx === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={waterfall} margin={{ top: 24, right: 24, left: 8, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tickFormatter={(v: number) => fmtMRR(v)} tick={{ fontSize: 11, fill: "#64748b" }} width={70} />
            <Tooltip content={<WaterfallTooltip />} />
            {/* Invisible base for offset */}
            <Bar dataKey="base" stackId="wf" fill="transparent" />
            <Bar dataKey="delta" stackId="wf" radius={[3, 3, 0, 0]}>
              {waterfall.map((s, i) => (
                <Cell key={i} fill={STEP_COLOR[s.kind]} />
              ))}
              <LabelList
                dataKey="signed"
                position="top"
                formatter={(v: any) => {
                  const n = Number(v);
                  return Math.abs(n) >= 1 ? (n === waterfall[0]?.signed || n === waterfall[waterfall.length - 1]?.signed ? fmtMRR(n) : fmtSigned(n)) : "";
                }}
                style={{ fontSize: 10, fontWeight: 600, fill: "#1f2937" }}
              />
            </Bar>
            <ReferenceLine y={0} stroke="#cbd5e1" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: STEP_COLOR.anchor }} />Anchor</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: STEP_COLOR.positive }} />Inflow (New / Expansion / Reactivation)</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: STEP_COLOR.negative }} />Outflow (Downgrade / Churn)</div>
        </div>
      </div>

      {/* Condensed monthly table */}
      <CompactTable table={table} />
    </section>
  );
}
