"use client";

import { useMemo } from "react";
import { useStore, isOverdue } from "@/lib/store";
import { Task, Status, Priority } from "@/lib/types";

const STATUSES: Status[] = ["todo", "in_progress", "blocked", "done"];

const statusColor: Record<Status, string> = {
  todo: "#cbd5e1",       // slate-300
  in_progress: "#1d4ed8", // blue-700
  blocked: "#b45309",    // amber-700
  done: "#047857",       // emerald-700
};
const statusLabel: Record<Status, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

const priorityColor: Record<Priority, string> = {
  low: "#94a3b8",   // slate-400
  medium: "#1d4ed8", // blue-700
  high: "#b91c1c",  // red-700
};

const priorityChip: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

function countByStatus(tasks: Task[]) {
  const counts: Record<Status, number> = {
    todo: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
  };
  for (const t of tasks) counts[t.status] += 1;
  return counts;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayLabel(d: Date, todayMid: Date) {
  const diff = Math.round(
    (d.getTime() - todayMid.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function VisualizeDashboard() {
  const { state } = useStore();

  // ---- Project health bars ------------------------------------------------
  const projectRows = useMemo(
    () =>
      state.projects.map((p) => {
        const tasks = state.tasks.filter((t) => t.projectId === p.id);
        const counts = countByStatus(tasks);
        const overdue = tasks.filter(isOverdue).length;
        return { project: p, tasks, counts, overdue, total: tasks.length };
      }),
    [state.projects, state.tasks]
  );

  // ---- Team workload ------------------------------------------------------
  const employees = useMemo(
    () => state.users.filter((u) => u.role === "employee"),
    [state.users]
  );
  const workloadRows = useMemo(
    () =>
      employees.map((u) => {
        const tasks = state.tasks.filter((t) => t.assigneeId === u.id);
        const counts = countByStatus(tasks);
        const overdue = tasks.filter(isOverdue).length;
        return { user: u, tasks, counts, overdue };
      }),
    [employees, state.tasks]
  );
  const maxWorkload = Math.max(
    1,
    ...workloadRows.map((r) => r.tasks.length)
  );

  // ---- Priority donut -----------------------------------------------------
  const priorityCounts = useMemo(() => {
    const c: Record<Priority, number> = { low: 0, medium: 0, high: 0 };
    for (const t of state.tasks) c[t.priority] += 1;
    return c;
  }, [state.tasks]);
  const totalForDonut =
    priorityCounts.low + priorityCounts.medium + priorityCounts.high;

  // ---- Daily schedule (overdue + next 14 days, listed by day) -------------
  const dailyGroups = useMemo(() => {
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    const day = 24 * 60 * 60 * 1000;

    const overdueTasks: Task[] = [];
    const buckets: { date: Date; tasks: Task[] }[] = [];
    for (let i = 0; i < 14; i++) {
      buckets.push({
        date: new Date(todayMid.getTime() + i * day),
        tasks: [],
      });
    }
    for (const t of state.tasks) {
      if (t.status === "done") continue;
      const td = new Date(t.deadline);
      td.setHours(0, 0, 0, 0);
      if (td.getTime() < todayMid.getTime()) {
        overdueTasks.push(t);
        continue;
      }
      const idx = Math.floor((td.getTime() - todayMid.getTime()) / day);
      if (idx >= 0 && idx < 14) buckets[idx].tasks.push(t);
    }

    // Sort overdue by oldest first; daily by priority high→low
    const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    overdueTasks.sort(
      (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
    for (const b of buckets) {
      b.tasks.sort(
        (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
      );
    }
    return { overdueTasks, buckets, todayMid };
  }, [state.tasks]);

  return (
    <div className="space-y-6">
      {/* Project health */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Project health
          </h3>
          <LegendStatus />
        </div>
        <div className="space-y-2">
          {projectRows.map((row) => (
            <div
              key={row.project.id}
              className="rounded-md border border-slate-200 bg-white p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${row.project.color}`}
                  />
                  <span className="text-sm font-semibold text-slate-900">
                    {row.project.name}
                  </span>
                  {row.overdue > 0 && (
                    <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {row.overdue} overdue
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {row.total} tasks
                </span>
              </div>
              <div className="mt-2 flex h-5 w-full overflow-hidden rounded-md bg-slate-100">
                {row.total === 0 ? (
                  <span className="grid w-full place-items-center text-[10px] text-slate-400">
                    no tasks
                  </span>
                ) : (
                  STATUSES.map((s) => {
                    const c = row.counts[s];
                    if (c === 0) return null;
                    const pct = (c / row.total) * 100;
                    return (
                      <div
                        key={s}
                        title={`${statusLabel[s]}: ${c}`}
                        style={{
                          width: `${pct}%`,
                          background: statusColor[s],
                        }}
                        className="grid place-items-center text-[10px] font-bold text-white"
                      >
                        {pct > 12 ? c : ""}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team workload + Priority donut */}
      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            Team workload
          </h3>
          <div className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
            {workloadRows.length === 0 && (
              <p className="text-sm italic text-slate-400">No employees.</p>
            )}
            {workloadRows.map((row) => {
              const total = row.tasks.length;
              const widthPct = (total / maxWorkload) * 100;
              return (
                <div key={row.user.id}>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-800 text-[10px] font-bold text-white shadow-sm">
                        {row.user.name.charAt(0)}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {row.user.name}
                      </span>
                      {row.overdue > 0 && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                          {row.overdue} overdue
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-slate-500">
                      {total} task{total === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-5 w-full overflow-hidden rounded-md bg-slate-100">
                    {total === 0 ? null : (
                      <div
                        className="flex h-full"
                        style={{ width: `${widthPct}%` }}
                      >
                        {STATUSES.map((s) => {
                          const c = row.counts[s];
                          if (c === 0) return null;
                          const pct = (c / total) * 100;
                          return (
                            <div
                              key={s}
                              title={`${statusLabel[s]}: ${c}`}
                              style={{
                                width: `${pct}%`,
                                background: statusColor[s],
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            Priority mix
          </h3>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <Donut total={totalForDonut} counts={priorityCounts} />
            <ul className="mt-3 space-y-1 text-xs">
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <li key={p} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: priorityColor[p] }}
                    />
                    <span className="font-medium capitalize text-slate-700">
                      {p}
                    </span>
                  </span>
                  <span className="font-semibold text-slate-900">
                    {priorityCounts[p]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Daily schedule — tasks listed under each day */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Daily schedule
          </h3>
          <span className="text-[11px] text-slate-500">
            Open tasks grouped by deadline day
          </span>
        </div>
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          {dailyGroups.overdueTasks.length > 0 && (
            <DaySection
              label="Overdue"
              detail={`${dailyGroups.overdueTasks.length} task${
                dailyGroups.overdueTasks.length === 1 ? "" : "s"
              } past their deadline`}
              tasks={dailyGroups.overdueTasks}
              tone="overdue"
            />
          )}
          {dailyGroups.buckets.map((b) => (
            <DaySection
              key={b.date.toISOString()}
              label={dayLabel(b.date, dailyGroups.todayMid)}
              detail={b.date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year:
                  b.date.getFullYear() === new Date().getFullYear()
                    ? undefined
                    : "numeric",
              })}
              tasks={b.tasks}
              tone={sameDay(b.date, dailyGroups.todayMid) ? "today" : "future"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DaySection({
  label,
  detail,
  tasks,
  tone,
}: {
  label: string;
  detail: string;
  tasks: Task[];
  tone: "overdue" | "today" | "future";
}) {
  const { state } = useStore();
  const headerCls =
    tone === "overdue"
      ? "bg-red-50 text-red-900"
      : tone === "today"
      ? "bg-slate-900 text-white"
      : "bg-slate-50 text-slate-700";
  const labelCls =
    tone === "overdue"
      ? "text-red-900"
      : tone === "today"
      ? "text-white"
      : "text-slate-900";

  return (
    <details
      open={tone !== "future" || tasks.length > 0}
      className="border-b border-slate-200 last:border-b-0"
    >
      <summary
        className={`flex cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-2.5 ${headerCls}`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${labelCls}`}>{label}</span>
          <span className="text-[11px] opacity-80">{detail}</span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            tone === "today"
              ? "bg-white/20 text-white"
              : tone === "overdue"
              ? "bg-red-700 text-white"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </span>
      </summary>
      {tasks.length === 0 ? (
        <div className="px-5 py-3 text-xs italic text-slate-400">
          No tasks scheduled.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((t) => {
            const assignee = state.users.find((u) => u.id === t.assigneeId);
            const project = state.projects.find((p) => p.id === t.projectId);
            const overdue = tone === "overdue";
            const deadline = new Date(t.deadline).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            return (
              <li
                key={t.id}
                className="flex flex-wrap items-start gap-3 px-5 py-3 hover:bg-slate-50"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: priorityColor[t.priority] }}
                  title={`Priority: ${t.priority}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {t.title}
                    </span>
                    {project && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${project.color}`}
                      >
                        {project.name}
                      </span>
                    )}
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold capitalize ${
                        priorityChip[t.priority]
                      }`}
                    >
                      {t.priority}
                    </span>
                    {overdue && (
                      <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Overdue
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {assignee?.name ?? "Unassigned"} ·{" "}
                    <span className="capitalize">
                      {t.status.replace("_", " ")}
                    </span>{" "}
                    · due {deadline}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </details>
  );
}

function LegendStatus() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px]">
      {STATUSES.map((s) => (
        <span key={s} className="flex items-center gap-1.5 text-slate-600">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: statusColor[s] }}
          />
          {statusLabel[s]}
        </span>
      ))}
    </div>
  );
}

function Donut({
  total,
  counts,
}: {
  total: number;
  counts: Record<Priority, number>;
}) {
  const size = 160;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <div className="grid h-40 place-items-center text-xs italic text-slate-400">
        No tasks
      </div>
    );
  }

  let cumulative = 0;
  const arcs = (["high", "medium", "low"] as Priority[]).map((p) => {
    const value = counts[p];
    const fraction = value / total;
    const arcLength = circumference * fraction;
    const dashOffset = circumference * (1 - cumulative);
    cumulative += fraction;
    return {
      key: p,
      arcLength,
      dashOffset,
      color: priorityColor[p],
    };
  });

  return (
    <div className="grid place-items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={`${a.arcLength} ${circumference - a.arcLength}`}
            strokeDashoffset={a.dashOffset}
            strokeLinecap="butt"
          />
        ))}
        <g transform="rotate(90 80 80)">
          <text
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            className="fill-slate-900 text-2xl font-extrabold"
          >
            {total}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 16}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] font-bold uppercase tracking-wider"
          >
            tasks
          </text>
        </g>
      </svg>
    </div>
  );
}
