"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fmtNumber } from "@/lib/format";
import ConversionTable from "./ConversionTable";
import type { S1S2Row } from "@/lib/types";

const ROLE_COLORS: Record<string, string> = {
  SDR: "#6366f1",
  BDR: "#8b5cf6",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const s1 = payload.find((p: any) => p.dataKey === "s1Deals")?.value ?? 0;
  const s2 = payload.find((p: any) => p.dataKey === "s2Deals")?.value ?? 0;
  const pct = s1 > 0 ? ((s2 / s1) * 100).toFixed(1) : "0.0";
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-gray-500">S1 Deals: <span className="font-bold text-gray-700">{fmtNumber(s1)}</span></p>
      <p className="text-indigo-600">S2 Deals: <span className="font-bold">{fmtNumber(s2)}</span></p>
      <p className="text-emerald-600">Conversion: <span className="font-bold">{pct}%</span></p>
    </div>
  );
};

const ChartLegend = () => (
  <div className="flex justify-end gap-5 pb-2 text-xs text-gray-600">
    <div className="flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-sm bg-indigo-500" />
      SDR
    </div>
    <div className="flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-sm bg-violet-500" />
      BDR
    </div>
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-0.5 w-4 rounded bg-emerald-400" style={{ verticalAlign: "middle" }} />
      <span className="inline-block h-2 w-2 -ml-1.5 rounded-full bg-emerald-400" style={{ verticalAlign: "middle" }} />
      {" "}Conversion %
    </div>
  </div>
);

export default function BySdr({ data }: { data: S1S2Row[] }) {
  const chartData = data.map((r) => ({
    name: r.name.split(" ")[0],
    role: r.role,
    s1Deals: r.s1Deals,
    s2Deals: r.s2Deals,
    convPct: r.s1Deals > 0 ? parseFloat(((r.s2Deals / r.s1Deals) * 100).toFixed(1)) : 0,
  }));

  return (
    <>
      <ChartLegend />
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 40, left: 8, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis yAxisId="deals" tick={{ fontSize: 11, fill: "#64748b" }} width={36} />
          <YAxis
            yAxisId="pct"
            orientation="right"
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={42}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar yAxisId="deals" dataKey="s1Deals" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={ROLE_COLORS[entry.role ?? ""] ?? "#6366f1"} />
            ))}
          </Bar>
          <Line yAxisId="pct" type="monotone" dataKey="convPct" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <ConversionTable rows={data} showRole={true} />
    </>
  );
}
