import { Suspense } from "react";
import { getFiscalQuarterDates } from "@/lib/shared/fiscal";
import { ALL_TAB_IDS, findSectionByTabId } from "@/sections/registry";
import SalesSection from "@/sections/sales/Section";
import SuccessSection from "@/sections/success/Section";
import MarketingSection from "@/sections/marketing/Section";
import type { SalesTabId } from "@/sections/sales/tabs";
import type { SuccessTabId } from "@/sections/success/tabs";
import type { MarketingTabId } from "@/sections/marketing/tabs";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { SidebarProvider } from "@/components/SidebarContext";

interface PageProps {
  searchParams: Promise<{ q?: string; y?: string; sec?: string }>;
}

const DEFAULT_TAB = "s2";

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const quarter = (parseInt(params.q ?? "1") || 1) as 1 | 2 | 3 | 4;
  const year = parseInt(params.y ?? "2026") || 2026;
  const fq = getFiscalQuarterDates(quarter, year);

  const requestedTab = params.sec ?? DEFAULT_TAB;
  const activeTab = ALL_TAB_IDS.has(requestedTab) ? requestedTab : DEFAULT_TAB;
  const owningSection = findSectionByTabId(activeTab)?.id ?? "sales";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Suspense fallback={<div className="w-56 flex-shrink-0 bg-slate-900" />}>
          <Sidebar />
        </Suspense>

        <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
          <TopBar fq={fq} />

          <main className="flex-1 overflow-y-auto px-6 py-8">
            <div className="mx-auto max-w-6xl">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-24 text-gray-400">
                    <div className="space-y-3 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-300 border-t-teal-600" />
                      <p className="text-sm">Loading…</p>
                    </div>
                  </div>
                }
              >
                {owningSection === "sales" && (
                  <SalesSection fq={fq} activeTab={activeTab as SalesTabId} />
                )}
                {owningSection === "success" && (
                  <SuccessSection fq={fq} activeTab={activeTab as SuccessTabId} />
                )}
                {owningSection === "marketing" && (
                  <MarketingSection fq={fq} activeTab={activeTab as MarketingTabId} />
                )}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
