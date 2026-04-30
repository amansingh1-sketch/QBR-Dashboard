"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SALES_SECTIONS = [
  { id: "s2",          label: "S2 Pipeline" },
  { id: "s1s2",        label: "S1→S2%" },
  { id: "winrate",     label: "Win Rate" },
  { id: "bookings",    label: "Bookings" },
  { id: "acv",         label: "ACV" },
  { id: "salescycle",  label: "Sales Cycle" },
  { id: "winreasons",  label: "Win Reasons" },
  { id: "lossreasons", label: "Loss Reasons" },
] as const;

const SALES_IDS = new Set(SALES_SECTIONS.map((s) => s.id));

const OTHER_TEAMS = [
  "Customer Success",
  "Marketing",
  "Product",
  "RevOps",
  "Data & Analytics",
];

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("sec") ?? "s2";

  // Sales is expanded only if a Sales section is active
  const [salesOpen, setSalesOpen] = useState(SALES_IDS.has(activeSection as any));

  function navigate(sec: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sec", sec);
    router.push(`?${params.toString()}`);
  }

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <div className="border-b border-gray-100 px-5 py-5">
        <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">QBR Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {/* Sales — collapsible */}
        <div className="mb-4">
          <button
            onClick={() => setSalesOpen((o) => !o)}
            className="mb-1 flex w-full items-center justify-between rounded-lg bg-indigo-50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="text-sm font-semibold text-indigo-700">Sales</span>
            </div>
            <svg
              className={`h-3.5 w-3.5 text-indigo-400 transition-transform ${salesOpen ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {salesOpen && (
            <div className="ml-3 space-y-0.5 border-l border-gray-100 pl-3">
              {SALES_SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    activeSection === id
                      ? "bg-indigo-50 font-semibold text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Other teams */}
        <div className="border-t border-gray-100 pt-3 space-y-0.5">
          {OTHER_TEAMS.map((team) => (
            <div
              key={team}
              className="flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2"
              title="Coming soon"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
              <span className="text-sm text-gray-400">{team}</span>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
