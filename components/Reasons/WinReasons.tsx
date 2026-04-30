"use client";

import StatCard from "@/components/ui/StatCard";
import ReasonsChart from "./ReasonsChart";
import { fmtMRR, fmtNumber } from "@/lib/format";
import type { ReasonsData } from "@/lib/types";

interface Props {
  data: ReasonsData;
  periodLabel: string;
}

export default function WinReasons({ data, periodLabel }: Props) {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Win Reasons</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Closed Won · New Business ·{" "}
            <code className="rounded bg-gray-100 px-1 text-xs">primary_win_reason</code>
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {periodLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Closed Won Deals"
          value={fmtNumber(data.totalDeals)}
          sub="With win reason data"
          accent="emerald"
        />
        <StatCard
          label="Won MRR"
          value={fmtMRR(data.totalMRR)}
          sub="Total booked MRR"
          accent="emerald"
        />
        <StatCard
          label="Top Reason"
          value={data.reasons[0]?.reason ?? "—"}
          sub={data.reasons[0] ? `${data.reasons[0].pct}% of deals` : ""}
          accent="emerald"
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <ReasonsChart
          data={data.reasons}
          totalDeals={data.totalDeals}
          totalMRR={data.totalMRR}
          accentColor="#10b981"
        />
      </div>
    </section>
  );
}
