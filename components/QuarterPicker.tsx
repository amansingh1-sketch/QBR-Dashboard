"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FiscalQuarter } from "@/lib/types";
import { getFiscalQuarterDates, getPreviousFiscalQuarter } from "@/lib/fiscal";

interface QuarterPickerProps {
  current: FiscalQuarter;
}

export default function QuarterPicker({ current }: QuarterPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(quarter: 1 | 2 | 3 | 4, year: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", String(quarter));
    params.set("y", String(year));
    router.push(`?${params.toString()}`);
  }

  const prev = getPreviousFiscalQuarter(current.quarter, current.year);

  const quarters: { q: 1 | 2 | 3 | 4; label: string }[] = [
    { q: 1, label: "Q1" },
    { q: 2, label: "Q2" },
    { q: 3, label: "Q3" },
    { q: 4, label: "Q4" },
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Quarter buttons */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {quarters.map(({ q, label }) => (
          <button
            key={q}
            onClick={() => navigate(q, current.year)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              current.quarter === q
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate(current.quarter, current.year - 1)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Previous year"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[52px] text-center text-sm font-bold text-gray-800">
          FY{current.year}
        </span>
        <button
          onClick={() => navigate(current.quarter, current.year + 1)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Next year"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Date range */}
      <span className="hidden rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-500 sm:block">
        {current.startDate} → {current.endDate}
      </span>
    </div>
  );
}
