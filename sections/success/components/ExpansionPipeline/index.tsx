"use client";

import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import StatCard from "@/lib/shared/ui/StatCard";
import { fmtNumber, fmtMRR } from "@/lib/shared/format";
import type { ExpansionPipelineSegment, PipelineCohort } from "../../types";

type CohortKey = "createdInQ1" | "closedInQ1" | "openIntoQ2";

const COHORT_LABELS: Record<CohortKey, string> = {
  createdInQ1: "Created in Q1",
  closedInQ1: "Closed in Q1",
  openIntoQ2: "Open going into Q2",
};

const COHORT_SUBS: Record<CohortKey, string> = {
  createdInQ1: "createdate Feb 1 – Apr 30, 2026",
  closedInQ1: "closedate Feb 1 – Apr 30, 2026",
  openIntoQ2: "closedate May 1 – Jul 31, 2026, dealstage ≠ closed",
};

const STAGE_COLORS = ["#6B8CAE", "#8B7FA8", "#06b6d4", "#f59e0b", "#5B9B8E", "#ef4444", "#ec4899", "#14b8a6"];

function CohortView({ cohort, label, sub, isClosed }: { cohort: PipelineCohort; label: string; sub: string; isClosed?: boolean }) {
  const stages = isClosed
    ? cohort.byStage.filter((s) => s.stage === "Closed Won" || s.stage === "Closed Lost")
    : cohort.byStage;

  const wonRow = isClosed ? cohort.byStage.find((s) => s.stage === "Closed Won") : undefined;
  const total = isClosed ? (wonRow?.deals ?? 0) : cohort.total;
  const totalAmt = isClosed ? (wonRow?.amount ?? 0) : cohort.totalAmount;
  const totalAcv = totalAmt * 12;

  const stageTotal = stages.reduce((s, r) => s + r.deals, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={isClosed ? "Closed Won Deals" : "Total Deals"} value={fmtNumber(total)} sub={sub} accent="indigo" />
        <StatCard label={isClosed ? "Closed Won MRR" : "Total MRR"} value={fmtMRR(totalAmt)} sub="Sum of deal amounts" accent="emerald" />
        <StatCard label={isClosed ? "Closed Won ACV" : "Total ACV"} value={fmtMRR(totalAcv)} sub="MRR × 12" accent="violet" />
      </div>

      {stages.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">{label} — by stage</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stages} margin={{ top: 4, right: 16, left: 8, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#64748b" }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={36} />
                <Tooltip />
                <Bar dataKey="deals" radius={[4, 4, 0, 0]}>
                  {stages.map((_, i) => (
                    <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Stage</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-500">Deals</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-500">Amount (MRR)</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-500">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((row, i) => {
                  const pct = stageTotal > 0 ? ((row.deals / stageTotal) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={row.stage} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: STAGE_COLORS[i % STAGE_COLORS.length] }} />
                          <span className="font-medium text-gray-800">{row.stage}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center text-gray-700">{fmtNumber(row.deals)}</td>
                      <td className="px-4 py-2 text-center font-semibold text-slate-700">{fmtMRR(row.amount)}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-slate-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-9 text-sm text-gray-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400">No deals in this cohort.</div>
      )}
    </div>
  );
}

interface Props {
  segment: ExpansionPipelineSegment;
  title: string;
  subtitle: string;
}

export default function ExpansionPipeline({ segment, title, subtitle }: Props) {
  const [active, setActive] = useState<CohortKey>("createdInQ1");
  const cohort = segment[active];
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="inline-flex rounded-lg bg-gray-100 p-1">
        {(Object.keys(COHORT_LABELS) as CohortKey[]).map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === c ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {COHORT_LABELS[c]}
          </button>
        ))}
      </div>

      <CohortView cohort={cohort} label={COHORT_LABELS[active]} sub={COHORT_SUBS[active]} isClosed={active === "closedInQ1"} />
    </section>
  );
}
