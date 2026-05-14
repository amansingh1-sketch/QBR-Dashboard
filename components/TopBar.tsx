"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Menu, ChevronRight } from "lucide-react";
import { SECTIONS, findSectionByTabId } from "@/sections/registry";
import { useSidebar } from "./SidebarContext";
import QuarterPicker from "./QuarterPicker";
import type { FiscalQuarter } from "@/lib/shared/types";

function Breadcrumb() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("sec") ?? "s2";
  const section = findSectionByTabId(activeTab);
  const tab = section?.tabs.find((t) => t.id === activeTab);

  return (
    <nav className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">QBR</span>
      <ChevronRight size={14} className="text-slate-300" />
      <span className="text-slate-500">{section?.label ?? "Dashboard"}</span>
      <ChevronRight size={14} className="text-slate-300" />
      <span className="font-semibold text-slate-900">{tab?.label ?? "Overview"}</span>
    </nav>
  );
}

export default function TopBar({ fq }: { fq: FiscalQuarter }) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="rounded-md p-1.5 text-slate-600 hover:bg-gray-100"
        >
          <Menu size={18} />
        </button>
        <Suspense fallback={<span className="text-sm text-slate-400">Loading…</span>}>
          <Breadcrumb />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <QuarterPicker current={fq} />
      </Suspense>
    </header>
  );
}
