"use client";

import { useState } from "react";
import SubTabs from "./SubTabs";
import TrendChart from "./TrendChart";
import KpiTable from "./KpiTable";
import StatCard from "@/lib/shared/ui/StatCard";
import type { AdSpendsData, KpiTable as KpiTableData } from "../types";

const SUB_TABS = [
  { id: "gads",     label: "GAds" },
  { id: "meta",     label: "Meta" },
  { id: "linkedin", label: "LinkedIn" },
] as const;

function fmtCurrency(value: number | null): string {
  if (value === null) return "—";
  if (Math.abs(value) >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${value.toFixed(2)}`;
}

function qoqDelta(q1: number | null, q4: number | null): { text: string; positive: boolean } | null {
  if (q1 === null || q4 === null || q4 === 0) return null;
  const pct = ((q1 - q4) / q4) * 100;
  const sign = pct >= 0 ? "+" : "";
  return { text: `${sign}${pct.toFixed(0)}% QoQ`, positive: pct >= 0 };
}

interface Props {
  data: AdSpendsData;
}

export default function AdSpends({ data }: Props) {
  const [activeSub, setActiveSub] = useState<string>("gads");

  const channelName =
    activeSub === "gads"     ? "GAds" :
    activeSub === "meta"     ? "Meta" :
                               "LinkedIn";

  const row = data.table.rows.find((r) => r.group === channelName);

  // Build a single-row sub-table for KpiTable rendering, without the redundant group column.
  const subTable: KpiTableData = {
    title: `${channelName} — Monthly Spend`,
    subtitle: "Source: Marketing_KPI_Workbook V2. Cells marked — have no data in the workbook yet.",
    rows: row
      ? [{ metric: "Spend (USD)", nov: row.nov, dec: row.dec, jan: row.jan, q4Total: row.q4Total, feb: row.feb, mar: row.mar, apr: row.apr, q1Total: row.q1Total }]
      : [],
  };

  const delta = row ? qoqDelta(row.q1Total, row.q4Total) : null;

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ad Spends</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Monthly paid media investment across GAds, Meta, and LinkedIn. Q4 and Q1 shown side-by-side.
          </p>
        </div>
      </div>

      <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />

      {row && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Q4 Spend"
            value={fmtCurrency(row.q4Total)}
            sub="Nov + Dec + Jan"
            accent="indigo"
          />
          <StatCard
            label="Q1 Spend"
            value={fmtCurrency(row.q1Total)}
            sub="Feb + Mar + Apr"
            accent="violet"
          />
          <StatCard
            label="QoQ Change"
            value={delta?.text ?? "—"}
            sub={delta ? (delta.positive ? "Spend up vs Q4" : "Spend down vs Q4") : "Insufficient data"}
            accent="emerald"
          />
        </div>
      )}

      <TrendChart table={subTable} variant="bar" format="currency" />
      <KpiTable table={subTable} format="currency" />
    </section>
  );
}
