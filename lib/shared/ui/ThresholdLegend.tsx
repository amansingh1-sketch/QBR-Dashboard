"use client";

interface Tier {
  color: "emerald" | "amber" | "red";
  label: string;
}

const COLOR_CLASS: Record<Tier["color"], string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-400",
  red: "bg-red-400",
};

const TEXT_CLASS: Record<Tier["color"], string> = {
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  red: "text-red-500",
};

interface Props {
  /** Tiers in order of best → worst */
  tiers: Tier[];
  /** Optional metric label, e.g. "S1→S2%" */
  metric?: string;
  className?: string;
}

export default function ThresholdLegend({ tiers, metric, className = "" }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 ${className}`}>
      {metric && <span className="font-semibold uppercase tracking-widest text-gray-400">{metric}</span>}
      {tiers.map((t, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${COLOR_CLASS[t.color]}`} />
          <span className={TEXT_CLASS[t.color]}>{t.label}</span>
        </span>
      ))}
    </div>
  );
}
