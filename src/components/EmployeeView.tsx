"use client";

import { useMemo } from "react";
import { useStore, isOverdue } from "@/lib/store";
import ReminderInbox from "./ReminderInbox";
import ProjectWorkspace from "./ProjectWorkspace";

export default function EmployeeView() {
  const { state, currentUser, visibleProjects } = useStore();

  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    const projectIds = new Set(visibleProjects.map((p) => p.id));
    return state.tasks.filter(
      (t) => projectIds.has(t.projectId) && t.assigneeId === currentUser.id
    );
  }, [state.tasks, visibleProjects, currentUser]);

  const openCount = myTasks.filter((t) => t.status !== "done").length;
  const overdueCount = myTasks.filter(isOverdue).length;
  const doneCount = myTasks.length - openCount;

  if (visibleProjects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">
          You aren&apos;t a member of any projects yet.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Ask Priya (the manager) to add you to a project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="My projects" value={visibleProjects.length} tone="slate" />
        <StatCard label="Open tasks" value={openCount} tone="indigo" />
        <StatCard
          label="Overdue"
          value={overdueCount}
          tone={overdueCount > 0 ? "rose" : "slate"}
        />
        <StatCard label="Completed" value={doneCount} tone="emerald" />
      </div>

      <ReminderInbox scope="employee" />

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
          My projects
        </h2>
        <ProjectWorkspace projects={visibleProjects} scope="employee" />
      </section>
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
