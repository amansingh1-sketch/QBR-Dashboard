"use client";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "indigo" | "emerald" | "violet";
}

const accentMap = {
  indigo: "border-indigo-500 bg-indigo-50",
  emerald: "border-emerald-500 bg-emerald-50",
  violet: "border-violet-500 bg-violet-50",
};

export default function StatCard({ label, value, sub, accent = "indigo" }: StatCardProps) {
  return (
    <div className={`rounded-xl border-l-4 bg-white px-4 py-3 shadow-sm ${accentMap[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
