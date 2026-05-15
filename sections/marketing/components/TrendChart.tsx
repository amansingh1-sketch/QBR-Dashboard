"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import type { KpiTable } from "../types";

const MONTH_KEYS = ["nov", "dec", "jan", "feb", "mar", "apr"] as const;
const MONTH_LABELS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const COLORS = ["#4f46e5", "#0d9488", "#7c3aed", "#ea580c", "#2563eb", "#db2777", "#059669", "#64748b"];

interface Props {
  table: KpiTable;
  /** "line" for trends, "bar" for spend/discrete. */
  variant?: "line" | "bar";
  format?: "number" | "currency";
}

function fmtAxis(value: number, format: "number" | "currency"): string {
  if (format === "currency") {
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function fmtTooltip(value: number, format: "number" | "currency"): string {
  if (format === "currency") return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return value.toLocaleString("en-US");
}

export default function TrendChart({ table, variant = "line", format = "number" }: Props) {
  const hasGroup = table.rows.some((r) => r.group !== undefined);
  const metrics = Array.from(new Set(table.rows.map((r) => r.metric)));
  const groups = hasGroup ? Array.from(new Set(table.rows.map((r) => r.group!))) : null;

  const firstWithData = hasGroup
    ? metrics.find((m) => {
        return table.rows.some(
          (r) => r.metric === m && MONTH_KEYS.some((k) => (r[k] ?? 0) !== 0),
        );
      }) ?? metrics[0]
    : metrics[0];
  const [activeMetric, setActiveMetric] = useState<string>(firstWithData ?? "");

  // Determine series: when grouped, one series per group (for the selected metric).
  // When not grouped, one series per metric.
  const seriesKeys = hasGroup ? groups! : metrics;

  const chartData = MONTH_KEYS.map((key, i) => {
    const point: Record<string, string | number> = { month: MONTH_LABELS[i] };
    if (hasGroup) {
      for (const g of groups!) {
        const row = table.rows.find((r) => r.group === g && r.metric === activeMetric);
        const v = row ? row[key] : null;
        point[g] = v ?? 0;
      }
    } else {
      for (const r of table.rows) {
        const v = r[key];
        point[r.metric] = v ?? 0;
      }
    }
    return point;
  });

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 24, right: 24, left: 8, bottom: 4 },
    };
    if (variant === "bar") {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => fmtAxis(v, format)} width={56} />
          <Tooltip formatter={(v) => fmtTooltip(Number(v), format)} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <ReferenceLine x="Jan" stroke="#94a3b8" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "Q4 → Q1", position: "insideTopRight", fill: "#334155", fontSize: 11, fontWeight: 600 }} />
          {seriesKeys.map((k, i) => (
            <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          ))}
        </BarChart>
      );
    }
    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => fmtAxis(v, format)} width={56} />
        <Tooltip formatter={(v) => fmtTooltip(Number(v), format)} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <ReferenceLine x="Jan" stroke="#94a3b8" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "Q4 → Q1", position: "insideTopRight", fill: "#334155", fontSize: 11, fontWeight: 600 }} />
        {seriesKeys.map((k, i) => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    );
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      {hasGroup && metrics.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Metric</span>
          <div className="flex flex-wrap gap-1">
            {metrics.map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeMetric === m
                    ? "border-slate-200 bg-slate-100 text-slate-700"
                    : "border-gray-200 bg-white text-gray-500 hover:text-gray-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={280}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
