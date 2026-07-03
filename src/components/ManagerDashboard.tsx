"use client";

import { useState, useMemo } from "react";
import { useStore, isOverdue } from "@/lib/store";
import AssignTaskModal from "./AssignTaskModal";
import BriefingPanel from "./BriefingPanel";
import ReminderInbox from "./ReminderInbox";
import AITaskAgent from "./AITaskAgent";
import ProjectWorkspace from "./ProjectWorkspace";

export default function ManagerDashboard() {
  const { state, visibleProjects } = useStore();
  const [showModal, setShowModal] = useState(false);

  const overdueCount = useMemo(
    () => state.tasks.filter(isOverdue).length,
    [state.tasks]
  );
  const openCount = useMemo(
    () => state.tasks.filter((t) => t.status !== "done").length,
    [state.tasks]
  );
  const doneCount = state.tasks.length - openCount;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Projects" value={visibleProjects.length} tone="slate" />
        <StatCard label="Open tasks" value={openCount} tone="indigo" />
        <StatCard
          label="Overdue"
          value={overdueCount}
          tone={overdueCount > 0 ? "rose" : "slate"}
        />
        <StatCard label="Completed" value={doneCount} tone="emerald" />
      </div>

      {/* Action row — agent + briefing side by side on wide screens */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AITaskAgent />
        <BriefingPanel />
      </div>

      {/* Reminders (already collapsible by row) */}
      <ReminderInbox scope="manager" />

      {/* Projects workspace — main organising element */}
      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Projects
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
          >
            + Assign task
          </button>
        </div>
        <ProjectWorkspace projects={visibleProjects} scope="manager" />
      </section>

      {showModal && (
        <AssignTaskModal
          onClose={() => setShowModal(false)}
          defaultProjectId={visibleProjects[0]?.id}
        />
      )}
    </div>
  );
}

const toneStyles: Record<string, { value: string; bg: string; label: string }> = {
  slate: {
    value: "text-slate-900",
    bg: "bg-white border-slate-200",
    label: "text-slate-500",
  },
  indigo: {
    value: "text-slate-900",
    bg: "bg-white border-l-4 border-l-blue-700 border-slate-200",
    label: "text-blue-700",
  },
  rose: {
    value: "text-red-700",
    bg: "bg-white border-l-4 border-l-red-700 border-slate-200",
    label: "text-red-700",
  },
  emerald: {
    value: "text-emerald-800",
    bg: "bg-white border-l-4 border-l-emerald-700 border-slate-200",
    label: "text-emerald-700",
  },
};

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "indigo" | "rose" | "emerald";
}) {
  const t = toneStyles[tone];
  return (
    <div className={`wf-card-hover rounded-lg border p-4 shadow-sm ${t.bg}`}>
      <div
        className={`text-[11px] font-bold uppercase tracking-wider ${t.label}`}
      >
        {label}
      </div>
      <div className={`mt-1 text-3xl font-extrabold ${t.value}`}>{value}</div>
    </div>
  );
}
