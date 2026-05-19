"use client";

import { useState } from "react";
import SubTabs from "./SubTabs";
import KpiTable from "./KpiTable";
import TrendChart from "./TrendChart";
import DiscussionPoints from "./DiscussionPoints";
import type { BrandData } from "../types";

const SUB_TABS = [
  { id: "social",      label: "Social Metrics" },
  { id: "reputation",  label: "Online Reputation" },
  { id: "discussion",  label: "Discussion Points" },
] as const;

const BRAND_DISCUSSION_POINTS = [
  {
    number: 11,
    title: "Social performance",
    description: "YouTube: 100K+ organic views, 624% QoQ — headline win. Instagram: follower growth 1,113% QoQ, reach up 23%. LinkedIn: impressions -38%, comments -33% — own it with plan. G2: 81.5% positive sentiment (contextualize Q4 spike).",
    tags: [
      { label: "YouTube breakout", type: "up" as const },
      { label: "Instagram growth", type: "up" as const },
      { label: "LinkedIn reach", type: "down" as const },
    ],
  },
  {
    number: 12,
    title: "Brand foundation shipped",
    description: "New narrative deployed on 25% of web pages. Brand guidelines and web components live. AI systems for 1-pagers and blog banners. Paused: JustCall MVP (employee amplification), JustCall Velocity (flagship virtual event) — state reason briefly.",
    tags: [
      { label: "Narrative + guidelines live", type: "up" as const },
      { label: "MVP paused", type: "arrow" as const },
      { label: "Velocity paused", type: "arrow" as const },
    ],
  },
  {
    number: 13,
    title: "Brand — Q2 priorities",
    description: "New narrative rollout to 100% of website. AI Design System: social carousels, thumbnails, marketing collaterals. JustCall Cinematic Universe: AI characters and video system. Frame all three as infrastructure investments that compound — not one-off campaigns.",
    tags: [
      { label: "Narrative completion", type: "neutral" as const },
      { label: "AI design system", type: "neutral" as const },
      { label: "Cinematic universe", type: "neutral" as const },
    ],
  },
];

interface Props {
  data: BrandData;
}

export default function Brand({ data }: Props) {
  const [activeSub, setActiveSub] = useState<string>("social");

  if (activeSub === "discussion") {
    return (
      <section className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Brand</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Social presence and online reputation. Q4 and Q1 shown side-by-side.
            </p>
          </div>
        </div>
        <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />
        <DiscussionPoints
          title="Brand Marketing"
          subtitle="Discussion points for Q1 FY2027 QBR — Act 4."
          points={BRAND_DISCUSSION_POINTS}
        />
      </section>
    );
  }

  const table = activeSub === "social" ? data.social : data.reputation;

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Brand</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Social presence and online reputation. Q4 and Q1 shown side-by-side.
          </p>
        </div>
      </div>

      <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />

      <TrendChart table={table} variant="line" />
      <KpiTable table={table} />
    </section>
  );
}
