"use client";

import { useState } from "react";

interface Props {
  onRefresh: () => Promise<string | null>;
}

export default function RefreshButton({ onRefresh }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setState("loading");
    setMessage("");
    const err = await onRefresh();
    if (err) {
      setState("error");
      setMessage(err);
    } else {
      setState("done");
      setMessage("Data refreshed from Google Sheet");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
      >
        <svg className={`h-3.5 w-3.5 ${state === "loading" ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {state === "loading" ? "Refreshing…" : "Refresh from Sheet"}
      </button>
      {message && (
        <span className={`text-xs ${state === "error" ? "text-red-500" : "text-emerald-600"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
