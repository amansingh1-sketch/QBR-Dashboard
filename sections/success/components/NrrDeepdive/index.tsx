"use client";

import { useState } from "react";
import StatCard from "@/lib/shared/ui/StatCard";
import CohortMatrix from "./CohortMatrix";
import TrendChart from "./TrendChart";
import type { CohortPoint, NrrDeepdiveData } from "../../types";

const SUB_TABS = [
  { id: "existing12m",      label: "12M NRR — Existing Customers" },
  { id: "threeMonth",       label: "3M NRR & Logo Retention" },
  { id: "newCustomers12m",  label: "12M NRR — New Customers" },
] as const;

type SubTabId = (typeof SUB_TABS)[number]["id"];

interface Props {
  data: NrrDeepdiveData;
}

function avg(points: CohortPoint[]): number {
  if (!points.length) return 0;
  return points.reduce((s, p) => s + p.pct, 0) / points.length;
}

function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

export default function NrrDeepdive({ data }: Props) {
  const [active, setActive] = useState<SubTabId>("existing12m");

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">NRR Deepdive</h2>
      </div>

      {/* Sub-tab nav */}
      <nav className="flex overflow-x-auto border-b border-gray-200" aria-label="NRR Deepdive sub-tabs">
        {SUB_TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-900 rounded-full" />}
            </button>
          );
        })}
      </nav>

      {active === "existing12m" && <Existing12m data={data.existing12m} />}
      {active === "threeMonth" && <ThreeMonth data={data.threeMonth} />}
      {active === "newCustomers12m" && <NewCustomers12m data={data.newCustomers12m} />}
    </section>
  );
}

// ───────────────────── Tab 1: 12M NRR Existing ─────────────────────

function Existing12m({ data }: { data: NrrDeepdiveData["existing12m"] }) {
  const trend = data.trend;
  const a = avg(trend);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{data.title}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{data.subtitle}</p>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Avg {fmtPct(a)}
          </span>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Earliest Cohort" value={fmtPct(trend[0]?.pct ?? 0)} sub={`${trend[0]?.cohort ?? "—"} → +12 mo`} accent="indigo" />
          <StatCard label="Latest Cohort" value={fmtPct(trend[trend.length - 1]?.pct ?? 0)} sub={`${trend[trend.length - 1]?.cohort ?? "—"} → +12 mo`} accent="violet" />
        </div>

        <TrendChart
          series={[{ name: "12-Month NRR", color: "#6366f1", data: trend, format: "currency" }]}
          yDomain={[80, 100]}
        />
      </div>

      <CohortMatrix matrix={data.nrrPercent} format="percent" />
      <CohortMatrix matrix={data.nrrAbsolute} format="currency" />
    </div>
  );
}

// ───────────────────── Tab 2: 3M NRR + Logo Retention ─────────────────────

function ThreeMonth({ data }: { data: NrrDeepdiveData["threeMonth"] }) {
  const avgNrr = avg(data.nrrTrend);
  const avgLogo = avg(data.logoTrend);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">{data.title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{data.subtitle}</p>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Avg 3-Month NRR" value={fmtPct(avgNrr)} sub="May 25 → Jan 26 cohorts" accent="indigo" />
          <StatCard label="Avg 3-Month Logo Retention" value={fmtPct(avgLogo)} sub="May 25 → Jan 26 cohorts" accent="emerald" />
        </div>

        <TrendChart
          series={[
            { name: "3-Month NRR ($)", color: "#6366f1", data: data.nrrTrend, format: "currency" },
            { name: "3-Month Logo Retention", color: "#10b981", data: data.logoTrend, format: "count" },
          ]}
          yDomain={[40, 120]}
          height={320}
        />
      </div>

      <CohortMatrix matrix={data.logoPercent} format="percent" startUnit="count" />
      <CohortMatrix matrix={data.logoAbsolute} format="count" />
      <CohortMatrix matrix={data.nrrPercent} format="percent" startUnit="currency" />
      <CohortMatrix matrix={data.nrrAbsolute} format="currency" />
    </div>
  );
}

// ───────────────────── Tab 3: 12M NRR New Customers ─────────────────────

function NewCustomers12m({ data }: { data: NrrDeepdiveData["newCustomers12m"] }) {
  const trend = data.trend;
  const a = avg(trend);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{data.title}</h3>
            <p className="mt-0.5 text-xs text-gray-500">{data.subtitle}</p>
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Avg {fmtPct(a)}
          </span>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Earliest Cohort" value={fmtPct(trend[0]?.pct ?? 0)} sub={`${trend[0]?.cohort ?? "—"} → +12 mo`} accent="indigo" />
          <StatCard label="Latest Cohort" value={fmtPct(trend[trend.length - 1]?.pct ?? 0)} sub={`${trend[trend.length - 1]?.cohort ?? "—"} → +12 mo`} accent="violet" />
        </div>

        <TrendChart
          series={[{ name: "12-Month NRR (License)", color: "#8b5cf6", data: trend, format: "currency" }]}
          yDomain={[40, 100]}
        />
      </div>

      <CohortMatrix matrix={data.nrrPercent} format="percent" />
      <CohortMatrix matrix={data.nrrAbsolute} format="currency" />
    </div>
  );
}
