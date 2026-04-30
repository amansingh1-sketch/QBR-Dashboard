import { Suspense } from "react";
import { getFiscalQuarterDates } from "@/lib/fiscal";
import { getS2PipelineData, getS1S2Data, getWinRateData, getBookingsData, getACVData, getSalesCycleData, getWinReasonsData, getLossReasonsData } from "@/lib/data";
import S2Pipeline from "@/components/S2Pipeline";
import S1S2 from "@/components/S1S2";
import WinRate from "@/components/WinRate";
import Bookings from "@/components/Bookings";
import ACV from "@/components/ACV";
import SalesCycle from "@/components/SalesCycle";
import WinReasons from "@/components/Reasons/WinReasons";
import LossReasons from "@/components/Reasons/LossReasons";
import QuarterPicker from "@/components/QuarterPicker";
import Sidebar from "@/components/Sidebar";
import type { FiscalQuarter } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ q?: string; y?: string; sec?: string }>;
}

async function S2PipelineSection({ fq }: { fq: FiscalQuarter }) {
  const data = await getS2PipelineData(fq.startDate, fq.endDate);
  return <S2Pipeline data={data} periodLabel={fq.label} />;
}

async function S1S2Section({ fq }: { fq: FiscalQuarter }) {
  const data = await getS1S2Data(fq.startDate, fq.endDate);
  return <S1S2 data={data} periodLabel={fq.label} />;
}

async function WinRateSection({ fq }: { fq: FiscalQuarter }) {
  const data = await getWinRateData(fq.startDate, fq.endDate);
  return <WinRate data={data} periodLabel={fq.label} />;
}

async function BookingsSection({ fq }: { fq: FiscalQuarter }) {
  const data = await getBookingsData(fq.startDate, fq.endDate);
  return <Bookings data={data} periodLabel={fq.label} />;
}

async function ACVSection({ fq }: { fq: FiscalQuarter }) {
  const data = await getACVData(fq.startDate, fq.endDate);
  return <ACV data={data} periodLabel={fq.label} />;
}

async function SalesCycleSection({ fq }: { fq: FiscalQuarter }) {
  const data = await getSalesCycleData(fq.startDate, fq.endDate);
  return <SalesCycle data={data} periodLabel={fq.label} />;
}

async function WinReasonsSection({ fq }: { fq: FiscalQuarter }) {
  const data = await getWinReasonsData(fq.startDate, fq.endDate);
  return <WinReasons data={data} periodLabel={fq.label} />;
}

async function LossReasonsSection({ fq }: { fq: FiscalQuarter }) {
  const data = await getLossReasonsData(fq.startDate, fq.endDate);
  return <LossReasons data={data} periodLabel={fq.label} />;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const quarter = (parseInt(params.q ?? "1") || 1) as 1 | 2 | 3 | 4;
  const year = parseInt(params.y ?? "2026") || 2026;
  const fq = getFiscalQuarterDates(quarter, year);
  const validSections = ["s2", "s1s2", "winrate", "bookings", "acv", "salescycle", "winreasons", "lossreasons"];
  const activeSection = (validSections.includes(params.sec ?? "") ? params.sec : "s2") as string;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left sidebar */}
      <Suspense fallback={<div className="w-56 flex-shrink-0 border-r border-gray-200 bg-white" />}>
        <Sidebar />
      </Suspense>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <h1 className="text-sm font-semibold text-gray-700">
            JustCall: Quarterly Business Review
          </h1>
          <Suspense fallback={null}>
            <QuarterPicker current={fq} />
          </Suspense>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-6xl">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-24 text-gray-400">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
                    <p className="text-sm">Loading…</p>
                  </div>
                </div>
              }
            >
              {activeSection === "s2"       && <S2PipelineSection fq={fq} />}
              {activeSection === "s1s2"    && <S1S2Section fq={fq} />}
              {activeSection === "winrate" && <WinRateSection fq={fq} />}
              {activeSection === "bookings" && <BookingsSection fq={fq} />}
              {activeSection === "acv"        && <ACVSection fq={fq} />}
              {activeSection === "salescycle"  && <SalesCycleSection fq={fq} />}
              {activeSection === "winreasons"  && <WinReasonsSection fq={fq} />}
              {activeSection === "lossreasons" && <LossReasonsSection fq={fq} />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
