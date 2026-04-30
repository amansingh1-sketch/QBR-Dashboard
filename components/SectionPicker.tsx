"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SECTIONS = [
  { id: "s2",      label: "S2 Pipeline" },
  { id: "s1s2",    label: "S1→S2%" },
  { id: "winrate", label: "Win Rate" },
] as const;

const COMING_SOON = ["Bookings", "Win Rate", "Sales Cycle", "ACV Mix", "Source Mix", "Region", "Headcount"];

export type SectionId = (typeof SECTIONS)[number]["id"];

export default function SectionPicker({ active }: { active: SectionId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(sec: SectionId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sec", sec);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 w-fit">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => navigate(id)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            active === id
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {label}
        </button>
      ))}
      {COMING_SOON.map((s) => (
        <button
          key={s}
          disabled
          title="Coming soon"
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
