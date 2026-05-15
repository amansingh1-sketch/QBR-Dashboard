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
    <nav className="flex items-center gap-1.5 text-sm">
      <span className="text-slate-400 font-medium">QBR</span>
      <ChevronRight size={13} className="text-slate-300" />
      <span className="text-slate-400 font-medium">{section?.label ?? "Dashboard"}</span>
      <ChevronRight size={13} className="text-slate-300" />
      <span className="font-semibold text-slate-800">{tab?.label ?? "Overview"}</span>
    </nav>
  );
}

export default function TopBar({ fq }: { fq: FiscalQuarter }) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={17} />
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
