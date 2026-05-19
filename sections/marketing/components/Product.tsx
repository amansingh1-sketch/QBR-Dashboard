"use client";

import { useState } from "react";
import SubTabs from "./SubTabs";
import KpiTable from "./KpiTable";
import TrendChart from "./TrendChart";
import DiscussionPoints from "./DiscussionPoints";
import type { ProductData } from "../types";

const SUB_TABS = [
  { id: "website",    label: "Website" },
  { id: "in-app",     label: "Product / In-App" },
  { id: "sales",      label: "Sales" },
  { id: "discussion", label: "Discussion Points" },
] as const;

const PRODUCT_DISCUSSION_POINTS = [
  {
    number: 8,
    title: "Funnel intelligence + messaging",
    description: "Demo-S2 leakage analysis (100+ ICP org size) shared with Sales and Marketing. ICP1 framework deployed across key web pages. Vertical marketing enablement sessions run. Integration UX revamp for retention and conversion.",
    tags: [
      { label: "ICP1 messaging live", type: "up" as const },
      { label: "Integration UX revamp", type: "up" as const },
    ],
  },
  {
    number: 9,
    title: "AI systems shipped",
    description: "Clark (call intelligence), Messaging GPT (factual product copy), Chalk (web page production speed). Frame as operational leverage — faster output, lower production cost, consistent brand voice.",
    tags: [
      { label: "3 systems live", type: "neutral" as const },
      { label: "Operational leverage story", type: "arrow" as const },
    ],
  },
  {
    number: 10,
    title: "PMM — Q2 priorities",
    description: "AI Operating System (team-wide). Weekly competitor + GTM intelligence. Monthly win/loss analysis. Monthly customer conversation trends + alignment with product and brand narrative. Case Studies: 1 HQ video. 1-click 1-pager system with brand guidelines.",
    tags: [
      { label: "6 initiatives", type: "neutral" as const },
      { label: "Intelligence + velocity theme", type: "arrow" as const },
    ],
  },
];

interface Props {
  data: ProductData;
}

export default function Product({ data }: Props) {
  const [activeSub, setActiveSub] = useState<string>("website");

  if (activeSub === "discussion") {
    return (
      <section className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Website page performance, in-app activation, and sales-side product signals.
            </p>
          </div>
        </div>
        <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />
        <DiscussionPoints
          title="Product Marketing"
          subtitle="Discussion points for Q1 FY2027 QBR — Act 3."
          points={PRODUCT_DISCUSSION_POINTS}
        />
      </section>
    );
  }

  const table =
    activeSub === "website" ? data.website :
    activeSub === "in-app"  ? data.inApp :
                              data.sales;

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Product</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Website page performance, in-app activation, and sales-side product signals.
          </p>
        </div>
      </div>

      <SubTabs tabs={SUB_TABS} activeId={activeSub} onChange={setActiveSub} />

      <TrendChart table={table} variant="line" />
      <KpiTable table={table} />
    </section>
  );
}
