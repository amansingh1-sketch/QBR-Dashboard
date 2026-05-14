"use client";

import { useState } from "react";
import StatCard from "@/lib/shared/ui/StatCard";
import ReasonsChart from "./ReasonsChart";
import AEFilter from "./AEFilter";
import { fmtMRR, fmtNumber } from "@/lib/shared/format";
import type { ReasonsData } from "@/sections/sales/types";

interface Props {
  data: ReasonsData;
  periodLabel: string;
}

export default function LossReasons({ data, periodLabel }: Props) {
  const [selectedAE, setSelectedAE] = useState<string>("");

  const aeRow = selectedAE ? data.byAE.find((r) => r.ownerId === selectedAE) : null;
  const reasons = aeRow ? aeRow.reasons : data.reasons;
  const totalDeals = aeRow ? aeRow.totalDeals : data.totalDeals;
  const totalMRR = aeRow ? aeRow.totalMRR : data.totalMRR;

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Loss Reasons</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Closed Lost · New Business ·{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">loss_reason__c</code>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={aeRow ? `${aeRow.name} · Lost Deals` : "Closed Lost Deals"}
          value={fmtNumber(totalDeals)}
          sub={aeRow ? "AE-filtered view" : "With loss reason data"}
          accent="indigo"
        />
        <StatCard
          label="Lost MRR"
          value={fmtMRR(totalMRR)}
          sub="Total lost pipeline"
          accent="indigo"
        />
        <StatCard
          label="Top Reason"
          value={reasons[0]?.reason ?? "—"}
          sub={reasons[0] ? `${reasons[0].pct}% of deals` : ""}
          accent="violet"
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex items-center justify-end">
          <AEFilter
            options={data.byAE}
            value={selectedAE}
            onChange={setSelectedAE}
          />
        </div>
        {reasons.length > 0 ? (
          <ReasonsChart
            data={reasons}
            accentColor="#ef4444"
          />
        ) : (
          <div className="py-12 text-center text-sm text-gray-400">
            No reasons recorded for this AE.
          </div>
        )}
      </div>
    </section>
  );
}
