"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FiscalQuarter } from "@/lib/shared/types";

interface QuarterPickerProps {
  current: FiscalQuarter;
}

export default function QuarterPicker({ current }: QuarterPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(quarter: 1 | 2 | 3 | 4) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", String(quarter));
    params.set("y", String(current.year));
    router.push(`?${params.toString()}`);
  }

  // Only Q1 has data right now; future quarters are disabled until data lands.
  const AVAILABLE_QUARTERS = new Set<1 | 2 | 3 | 4>([1]);

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
        {quarters.map(({ q, label }) => {
          const isAvailable = AVAILABLE_QUARTERS.has(q);
          const isCurrent = current.quarter === q;
          return (
            <button
              key={q}
              onClick={() => isAvailable && navigate(q)}
              disabled={!isAvailable}
              title={isAvailable ? undefined : "No data available yet"}
              aria-disabled={!isAvailable}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                isCurrent
                  ? "bg-violet-500 text-white shadow-sm"
                  : isAvailable
                    ? "text-gray-500 hover:text-gray-700"
                    : "cursor-not-allowed text-gray-300"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Locked fiscal year */}
      <span className="rounded-md bg-violet-50 px-3 py-1.5 text-sm font-bold text-violet-700">
        FY{current.year + 1}
      </span>

      {/* Date range */}
      <span className="hidden rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-500 sm:block">
        {current.startDate} → {current.endDate}
      </span>
    </div>
  );
}
