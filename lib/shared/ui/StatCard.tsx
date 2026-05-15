"use client";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "indigo" | "emerald" | "violet";
}

const accentMap = {
  indigo:  "border-[#6B8CAE]",
  emerald: "border-[#5B9B8E]",
  violet:  "border-[#8B7FA8]",
};

export default function StatCard({ label, value, sub, accent = "indigo" }: StatCardProps) {
  return (
    <div className={`rounded-xl border-l-4 bg-white px-4 py-3 shadow-sm ${accentMap[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
