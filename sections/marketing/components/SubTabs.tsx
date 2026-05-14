"use client";

interface SubTab {
  id: string;
  label: string;
}

interface Props {
  tabs: ReadonlyArray<SubTab>;
  activeId: string;
  onChange: (id: string) => void;
}

export default function SubTabs({ tabs, activeId, onChange }: Props) {
  return (
    <nav className="flex overflow-x-auto border-b border-gray-100" aria-label="Sub-tabs">
      {tabs.map((tab) => {
        const active = activeId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
              active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-900 rounded-full" />}
          </button>
        );
      })}
    </nav>
  );
}
