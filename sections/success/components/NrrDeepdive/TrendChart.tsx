"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import type { CohortPoint } from "../../types";

interface Series {
  name: string;
  color: string;
  data: CohortPoint[];
  format: "currency" | "count";
}

interface Props {
  series: Series[];
  yDomain?: [number, number];
  height?: number;
}

function fmtMoney(v: number | null | undefined): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtCount(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toLocaleString("en-US");
}

export default function TrendChart({ series, yDomain = [40, 120], height = 300 }: Props) {
  // Merge series by cohort so they share one X-axis.
  const cohorts = Array.from(new Set(series.flatMap((s) => s.data.map((p) => p.cohort))));
  const chartData = cohorts.map((cohort) => {
    const point: Record<string, string | number | null> = { cohort };
    for (const s of series) {
      const found = s.data.find((p) => p.cohort === cohort);
      point[s.name] = found?.pct ?? null;
      point[`${s.name}__num`] = found?.numerator ?? null;
      point[`${s.name}__den`] = found?.denominator ?? null;
      point[`${s.name}__fmt`] = s.format;
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="cohort" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickFormatter={(v) => `${v}%`}
          domain={yDomain}
          width={48}
        />
        <Tooltip
          formatter={(value, name, item) => {
            const payload = (item as { payload?: Record<string, unknown> })?.payload ?? {};
            const num = payload[`${name as string}__num`] as number | null;
            const den = payload[`${name as string}__den`] as number | null;
            const fmt = payload[`${name as string}__fmt`] as "currency" | "count";
            const formatter = fmt === "count" ? fmtCount : fmtMoney;
            return [`${Number(value).toFixed(2)}%  (${formatter(num)} / ${formatter(den)})`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        <ReferenceLine y={100} stroke="#cbd5e1" strokeDasharray="3 3" label={{ value: "100%", position: "right", fontSize: 10, fill: "#94a3b8" }} />
        {series.map((s) => (
          <Line
            key={s.name}
            name={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2.5}
            dot={{ r: 5, fill: s.color }}
            activeDot={{ r: 7 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
