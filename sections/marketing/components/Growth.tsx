"use client";

import { useState } from "react";
import SubTabs from "./SubTabs";
import KpiTable from "./KpiTable";
import TrendChart from "./TrendChart";
import StatCard from "@/lib/shared/ui/StatCard";
import DiscussionPoints from "./DiscussionPoints";
import type { GrowthData, AdSpendsData, KpiTable as KpiTableData } from "../types";

const SUB_TABS = [
  { id: "ad-spends",   label: "Ad Spends" },
  { id: "overall",     label: "Overall Metrics" },
  { id: "web",         label: "Website Engagement" },
  { id: "plg",         label: "PLG (Signups)" },
  { id: "slg",         label: "SLG (Demos)" },
  { id: "cpl",         label: "CPL" },
  { id: "cac",         label: "CAC" },
  { id: "discussion",  label: "Discussion Points" },
] as const;

const GROWTH_DISCUSSION_POINTS = [
  {
    number: 2,
    title: "Performance marketing",
    description: "SLG demo attainment, Paid Search 144%, Direct 112%, Paid Social 161%, PLG 135% customers, 13% MRR, S2 at 56% of plan — show as rebuilding trajectory. Meta as pipeline engine, 100+ video creative variations, LP CRO, new messaging.",
    tags: [
      { label: "Meta pipeline", type: "up" as const },
      { label: "Creative velocity", type: "up" as const },
      { label: "AirCall CPL", type: "down" as const },
      { label: "LinkedIn demos", type: "down" as const },
    ],
  },
  {
    number: 3,
    title: "SEO / AEO",
    description: "SLG 85-4% demos, 91.5% S2, PLG 73.2% trials, 61% customers, 57% MRR. What worked: competitor + pricing pages, AirCall alternative experiment, area code refreshes. LLM traffic decline framed as industry-wide, not execution failure.",
    tags: [
      { label: "Competitor pages", type: "up" as const },
      { label: "LLM experiment", type: "up" as const },
      { label: "Transcript blogs", type: "up" as const },
      { label: "LLM traffic (industry)", type: "down" as const },
    ],
  },
  {
    number: 4,
    title: "CRO",
    description: "Mobile Demo CTA: 100+ incremental demos/month. Brand LP CVR: 6% → 9%. Dialer page CVR improvements. Multi-path Contact Us experiment failed — reverted. RedScope CRO collab started April.",
    tags: [
      { label: "Mobile CTA unlock", type: "up" as const },
      { label: "LP CVR +50%", type: "up" as const },
      { label: "Multi-path experiment", type: "down" as const },
      { label: "RedScope in progress", type: "arrow" as const },
    ],
  },
  {
    number: 5,
    title: "Vertical marketing",
    description: "Started with Dental & Solar. 1.5M+ ICPI Impressions. 237 engaged accounts passed to BDR for outreach. Early-stage channel — frame as pipeline seeding, not pipeline delivery yet.",
    tags: [
      { label: "Pipeline seeding stage", type: "arrow" as const },
      { label: "2 verticals live", type: "neutral" as const },
    ],
  },
  {
    number: 6,
    title: "Marketing outbound",
    description: "Heavily underperformed. New infra and agency tested — no meaningful uptick in positive replies or attributed demos. Own it clearly: hypothesis tested, didn't move the needle (pivot or kill).",
    tags: [
      { label: "No attributed demos", type: "down" as const },
      { label: "No reply uplift", type: "down" as const },
      { label: "decision needed", type: "neutral" as const },
    ],
  },
  {
    number: 7,
    title: "Growth — Q2 priorities",
    description: "Media decision-maker messaging shift. LinkedIn: horizontal ICPI scaling. SEO real estate/home services verticals + BOF LLM blogs + AirCall 4-category attack + SF/HS integration visibility. CRO: RedScope ongoing. Conditional: Home Services Allbound + agency evaluation.",
    tags: [
      { label: "5 active bets", type: "neutral" as const },
      { label: "2 pending approval", type: "neutral" as const },
    ],
  },
];

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

  if (activeSub === "discussion") {
    return (
      <section className="space-y-5">
        <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />
        <DiscussionPoints
          title="Growth Marketing"
          subtitle="Discussion points for Q1 FY2027 QBR — Act 2."
          points={GROWTH_DISCUSSION_POINTS}
        />
      </section>
    );
  }

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

  const rowFormat =
    activeSub === "cpl"     ? (m: string) => (m === "# of Leads" ? "number" : "currency") as "number" | "currency" :
    activeSub === "overall" ? (m: string) => (m === "MRR" ? "currency" : "number") as "number" | "currency" :
    undefined;

  // For CPL: "# of Leads" is higher-better; cost rows are lower-better.
  // For CAC: all rows are lower-better.
  const lowerIsBetter = activeSub === "cac";
  const rowLowerIsBetter =
    activeSub === "cpl"
      ? (m: string) => m !== "# of Leads"
      : undefined;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Growth</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Funnel performance by channel, plus blended CPL/CAC efficiency.
        </p>
      </div>

      <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />

      <TrendChart table={table} variant="line" format={format} rowFormat={rowFormat} />
      <KpiTable
        table={table}
        format={format}
        rowFormat={rowFormat}
        lowerIsBetter={lowerIsBetter}
        rowLowerIsBetter={rowLowerIsBetter}
      />
    </section>
  );
}
