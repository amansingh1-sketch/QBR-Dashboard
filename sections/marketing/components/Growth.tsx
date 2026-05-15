"use client";

import { useState } from "react";
import SubTabs from "./SubTabs";
import KpiTable from "./KpiTable";
import TrendChart from "./TrendChart";
import StatCard from "@/lib/shared/ui/StatCard";
import type { GrowthData, AdSpendsData, KpiTable as KpiTableData } from "../types";

const SUB_TABS = [
  { id: "ad-spends", label: "Ad Spends" },
  { id: "overall",   label: "Overall Metrics" },
  { id: "web",       label: "Website Engagement" },
  { id: "plg",       label: "PLG (Signups)" },
  { id: "slg",       label: "SLG (Demos)" },
  { id: "cpl",       label: "CPL" },
  { id: "cac",       label: "CAC" },
] as const;

const AD_SPEND_CHANNELS = [
  { id: "gads",     label: "GAds" },
  { id: "meta",     label: "Meta" },
  { id: "linkedin", label: "LinkedIn" },
] as const;

function fmtCurrency(value: number | null): string {
  if (value === null) return "—";
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
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
  data: GrowthData;
  adSpendsData?: AdSpendsData;
}

export default function Growth({ data, adSpendsData }: Props) {
  const [activeSub, setActiveSub] = useState<string>("ad-spends");
  const [activeChannel, setActiveChannel] = useState<string>("gads");

  if (activeSub === "ad-spends" && adSpendsData) {
    const channelName =
      activeChannel === "gads" ? "GAds" :
      activeChannel === "meta" ? "Meta" :
                                 "LinkedIn";

    const row = adSpendsData.table.rows.find((r) => r.group === channelName);
    const subTable: KpiTableData = {
      title: `${channelName} — Monthly Spend`,
      subtitle: "Source: Marketing_KPI_Workbook V2.",
      rows: row
        ? [{ metric: "Spend (USD)", nov: row.nov, dec: row.dec, jan: row.jan, q4Total: row.q4Total, feb: row.feb, mar: row.mar, apr: row.apr, q1Total: row.q1Total }]
        : [],
    };
    const delta = row ? qoqDelta(row.q1Total, row.q4Total) : null;

    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Growth</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Funnel performance by channel, plus blended CPL/CAC efficiency.
          </p>
        </div>

        <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />

        <SubTabs tabs={AD_SPEND_CHANNELS} activeId={activeChannel} onChange={setActiveChannel} />

        {row && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Q4 Spend" value={fmtCurrency(row.q4Total)} sub="Nov + Dec + Jan" accent="indigo" />
            <StatCard label="Q1 Spend" value={fmtCurrency(row.q1Total)} sub="Feb + Mar + Apr" accent="violet" />
            <StatCard label="QoQ Change" value={delta?.text ?? "—"} sub={delta ? (delta.positive ? "Spend up vs Q4" : "Spend down vs Q4") : "Insufficient data"} accent="emerald" />
          </div>
        )}

        <TrendChart table={subTable} variant="bar" format="currency" />
        <KpiTable table={subTable} format="currency" />
      </section>
    );
  }

  const table =
    activeSub === "overall" ? data.overallMetrics :
    activeSub === "web"     ? data.websiteEngagement :
    activeSub === "plg"     ? data.plg :
    activeSub === "slg"     ? data.slg :
    activeSub === "cpl"     ? data.cpl :
                              data.cac;

  const format = activeSub === "cpl" || activeSub === "cac" ? "currency" : "number";

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Growth</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Funnel performance by channel, plus blended CPL/CAC efficiency.
        </p>
      </div>

      <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />

      <TrendChart table={table} variant="line" format={format} />
      <KpiTable table={table} format={format} />
    </section>
  );
}
