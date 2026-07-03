"use client";

import { useState } from "react";
import TeamSummary from "./TeamSummary";
import VisualizeDashboard from "./VisualizeDashboard";

type Tab = "briefing" | "visualize";

export default function BriefingPanel() {
  const [tab, setTab] = useState<Tab>("briefing");

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              AI
            </span>
            <h2 className="text-base font-bold">Where&apos;s My Team?</h2>
          </div>
          <p className="mt-0.5 text-xs text-white/75">
            Switch between an AI-written briefing and a visual snapshot of every project.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-white/10 p-1 text-xs font-bold">
          <TabButton active={tab === "briefing"} onClick={() => setTab("briefing")}>
            Briefing
          </TabButton>
          <TabButton
            active={tab === "visualize"}
            onClick={() => setTab("visualize")}
          >
            Visualize
          </TabButton>
        </div>
      </div>

      <div className="bg-white p-5">
        {tab === "briefing" ? <TeamSummary embedded /> : <VisualizeDashboard />}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-white/80 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
