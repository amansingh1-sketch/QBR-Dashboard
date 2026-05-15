"use client";

import { useState } from "react";
import { fmtNumber } from "@/lib/shared/format";
import type { ProductAdoptionData, ProductAdoptionRow } from "../../types";

type Cohort = "new" | "existing" | "total";

const COHORT_LABELS: Record<Cohort, string> = {
  new: "New customers",
  existing: "Existing customers",
  total: "Total Customer base",
};

// Module-group color palette — each group gets its own tinted background to match the xlsx layout.
const MODULE_STYLES: Record<string, { bg: string; label: string; left: string }> = {
  "Voice Module":         { bg: "bg-emerald-50",  left: "border-l-4 border-emerald-300", label: "text-teal-800" },
  "SMS Module":           { bg: "bg-orange-50",   left: "border-l-4 border-orange-300",  label: "text-orange-800" },
  "IVR Module":           { bg: "bg-sky-50",      left: "border-l-4 border-sky-300",     label: "text-sky-800" },
  "Sales Dialer Module":  { bg: "bg-fuchsia-50",  left: "border-l-4 border-fuchsia-300", label: "text-fuchsia-800" },
  "Integrations":         { bg: "bg-amber-50",    left: "border-l-4 border-amber-300",   label: "text-amber-800" },
};

const DEFAULT_STYLE = { bg: "bg-gray-50", left: "border-l-4 border-gray-200", label: "text-gray-700" };

interface ModuleBlock {
  group: string;
  rows: ProductAdoptionRow[];
}

function organize(rows: ProductAdoptionRow[]): { customerBase: ProductAdoptionRow | null; modules: ModuleBlock[] } {
  const customerBase = rows.find((r) => r.is_customer_base) ?? null;
  const blocks = new Map<string, ProductAdoptionRow[]>();
  const order: string[] = [];
  for (const r of rows) {
    if (r.is_customer_base) continue;
    const g = r.module_group ?? "Other";
    if (!blocks.has(g)) { blocks.set(g, []); order.push(g); }
    blocks.get(g)!.push(r);
  }
  return { customerBase, modules: order.map((g) => ({ group: g, rows: blocks.get(g)! })) };
}

function CohortTable({
  title,
  cohortKey,
  rows,
  months,
}: {
  title: string;
  cohortKey: Cohort;
  rows: ProductAdoptionRow[];
  months: string[];
}) {
  const { customerBase, modules } = organize(rows);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-gray-800">{title}</div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-500" style={{ width: "20%" }}>Module</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-500" style={{ width: "32%" }}>Metric</th>
            {months.map((m) => (
              <th key={m} className="px-3 py-2 text-right font-semibold text-gray-500">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customerBase && (
            <tr className="bg-gray-50 font-semibold">
              <td className="px-3 py-2 text-gray-700"></td>
              <td className="px-3 py-2 text-gray-900">{customerBase.metric}</td>
              {customerBase.values.map((v, j) => (
                <td key={j} className="px-3 py-2 text-right text-gray-900">{v == null ? "—" : fmtNumber(v)}</td>
              ))}
            </tr>
          )}
          {modules.map(({ group, rows: groupRows }) => {
            const style = MODULE_STYLES[group] ?? DEFAULT_STYLE;
            return groupRows.map((r, i) => (
              <tr key={`${group}-${r.metric}`} className={`${style.bg} ${i === 0 ? "border-t border-gray-200" : ""}`}>
                <td className={`px-3 py-2 ${style.left}`}>
                  {i === 0 && <span className={`text-xs font-bold uppercase tracking-wide ${style.label}`}>{group}</span>}
                </td>
                <td className={`px-3 py-2 ${i === 0 ? "font-semibold text-gray-800" : "text-gray-700"}`}>{r.metric}</td>
                {r.values.map((v, j) => (
                  <td key={j} className={`px-3 py-2 text-right ${i === 0 ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {v == null ? "—" : fmtNumber(v)}
                  </td>
                ))}
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductAdoption({ data }: { data: ProductAdoptionData }) {
  const [active, setActive] = useState<Cohort>("new");

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Product Adoption</h2>
        <p className="text-sm text-gray-500">
          Scaled cohort — non-zero / adopter / power-user counts by module. Source: Growth Retention xlsx · Product adoption.
        </p>
      </div>

      <div className="inline-flex rounded-lg bg-gray-100 p-1">
        {(Object.keys(COHORT_LABELS) as Cohort[]).map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === c ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {COHORT_LABELS[c]}
          </button>
        ))}
      </div>

      <CohortTable
        title={COHORT_LABELS[active]}
        cohortKey={active}
        rows={data.cohorts[active] ?? []}
        months={data.months}
      />
    </section>
  );
}
