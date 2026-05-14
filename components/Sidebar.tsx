"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { SECTIONS } from "@/sections/registry";
import { useSidebar } from "./SidebarContext";

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("sec") ?? "s2";
  const { collapsed } = useSidebar();

  const activeSectionId = SECTIONS.find((s) => s.tabs.some((t) => t.id === activeTab))?.id ?? "sales";
  const [openSection, setOpenSection] = useState<string>(activeSectionId);

  function navigate(tabId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sec", tabId);
    router.push(`?${params.toString()}`);
  }

  return (
    <aside
      className={`flex flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900 sticky top-0 h-screen overflow-y-auto transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Brand */}
      <div className={`flex items-center border-b border-slate-800 ${collapsed ? "justify-center px-2 py-4" : "px-4 py-4"}`}>
        <span className="text-sm font-bold uppercase tracking-widest text-white">
          {collapsed ? "QBR" : "QBR Dashboard"}
        </span>
      </div>

      <nav className="flex-1 px-2 py-4">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Departments
          </p>
        )}

        <div className="space-y-1">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isOpen = openSection === section.id;
            const isActiveSection = section.id === activeSectionId;

            if (!section.enabled) {
              return (
                <div
                  key={section.id}
                  className={`flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-2 text-slate-500 ${
                    collapsed ? "justify-center" : ""
                  }`}
                  title={`${section.label} — coming soon`}
                >
                  <Icon size={18} />
                  {!collapsed && <span className="text-sm">{section.label}</span>}
                </div>
              );
            }

            return (
              <div key={section.id}>
                <button
                  onClick={() => {
                    if (collapsed) {
                      // In collapsed mode, click jumps to first tab of section.
                      const first = section.tabs[0];
                      if (first) navigate(first.id);
                    } else {
                      setOpenSection(isOpen ? "" : section.id);
                    }
                  }}
                  title={collapsed ? section.label : undefined}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                    isActiveSection
                      ? "bg-teal-500/20 text-teal-300"
                      : "text-slate-200 hover:bg-slate-800"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-semibold">{section.label}</span>
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isOpen ? "rotate-90" : ""} text-slate-400`}
                      />
                    </>
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="ml-3 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                    {section.tabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => navigate(t.id)}
                        className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                          activeTab === t.id
                            ? "bg-teal-500/15 font-semibold text-teal-200"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
