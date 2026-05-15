"use client";

export const ALL_DEAL_TYPES = ["land", "expandH", "expandV"] as const;
export type DealTypeKey = (typeof ALL_DEAL_TYPES)[number];

const LABELS: Record<DealTypeKey, string> = {
  land:    "Land",
  expandH: "Expand H",
  expandV: "Expand V",
};

interface Props {
  selected: Set<DealTypeKey>;
  onChange: (next: Set<DealTypeKey>) => void;
}

export default function DealTypeFilter({ selected, onChange }: Props) {
  function toggle(key: DealTypeKey) {
    // If all are selected, clicking one type selects only that type
    if (selected.size === ALL_DEAL_TYPES.length) {
      onChange(new Set([key]));
      return;
    }
    const next = new Set(selected);
    if (next.has(key)) {
      if (next.size === 1) return; // keep at least one selected
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  }

  const allSelected = selected.size === ALL_DEAL_TYPES.length;

  function toggleAll() {
    onChange(allSelected ? new Set(["land"]) : new Set(ALL_DEAL_TYPES));
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Deal type
      </span>
      <div className="flex gap-1">
        <button
          onClick={toggleAll}
          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
            allSelected
              ? "border-slate-200 bg-slate-100 text-slate-700"
              : "border-gray-200 bg-white text-gray-400 hover:text-gray-600"
          }`}
        >
          All
        </button>
        {ALL_DEAL_TYPES.map((key) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              selected.has(key) && !allSelected
                ? "border-slate-200 bg-slate-100 text-slate-700"
                : "border-gray-200 bg-white text-gray-500 hover:text-gray-700"
            }`}
          >
            {LABELS[key]}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Aggregate deals+mrr for a row that has land/expandH/expandV splits */
export function applyDealTypeFilter(
  row: { deals: number; mrr: number; land: { deals: number; mrr: number }; expandH: { deals: number; mrr: number }; expandV: { deals: number; mrr: number } },
  selected: Set<DealTypeKey>
): { deals: number; mrr: number } {
  if (selected.size === ALL_DEAL_TYPES.length) return { deals: row.deals, mrr: row.mrr };
  let deals = 0, mrr = 0;
  if (selected.has("land"))    { deals += row.land.deals;    mrr += row.land.mrr; }
  if (selected.has("expandH")) { deals += row.expandH.deals; mrr += row.expandH.mrr; }
  if (selected.has("expandV")) { deals += row.expandV.deals; mrr += row.expandV.mrr; }
  return { deals, mrr: Math.round(mrr * 100) / 100 };
}
