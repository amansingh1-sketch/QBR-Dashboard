"use client";

import type { ReasonsAERow } from "@/sections/sales/types";

interface Props {
  options: ReasonsAERow[];
  value: string;
  onChange: (ownerId: string) => void;
}

export default function AEFilter({ options, value, onChange }: Props) {
  const sorted = [...options].sort((a, b) => b.totalDeals - a.totalDeals);
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        AE
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-sm text-gray-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">All AEs</option>
        {sorted.map((r) => (
          <option key={r.ownerId} value={r.ownerId}>
            {r.name} ({r.totalDeals})
          </option>
        ))}
      </select>
    </div>
  );
}
