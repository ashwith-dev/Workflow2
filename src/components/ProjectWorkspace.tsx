"use client";

import { useState, useMemo } from "react";
import { useStore, isOverdue, relativeTime } from "@/lib/store";
import { Task, Project, Status } from "@/lib/types";
import DateFilterBar, {
  DateFilterValue,
  filterTasksByDate,
  dateFilterLabel,
} from "./DateFilterBar";
import WorkLogForm from "./WorkLogForm";
import VerdictBadge from "./VerdictBadge";

interface Props {
  projects: Project[];
  scope: "manager" | "employee";
}

const STATUSES: Status[] = ["todo", "in_progress", "blocked", "done"];

const statusChip: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  blocked: "bg-amber-100 text-amber-800 border-amber-200",
  done: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const priorityChip: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

export default function ProjectWorkspace({ projects, scope }: Props) {
  const { state } = useStore();
  const [selectedId, setSelectedId] = useState<string>(projects[0]?.id ?? "");
  const [filter, setFilter] = useState<DateFilterValue>({ kind: "thisweek" });

  const project = projects.find((p) => p.id === selectedId) ?? projects[0];

  const tasksForProject = useMemo(
    () => state.tasks.filter((t) => t.projectId === project?.id),
    [state.tasks, project?.id]
  );

  const filteredTasks = useMemo(
    () =>
      filterTasksByDate(tasksForProject, filter).sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ),
    [tasksForProject, filter]
  );

  if (!project) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        You aren&apos;t a member of any projects yet.
      </div>
    );
  }

  const open = tasksForProject.filter((t) => t.status !== "done").length;
  const overdueCount = tasksForProject.filter(isOverdue).length;
  const done = tasksForProject.length - open;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Project tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
        {projects.map((p) => {
          const active = p.id === project.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${p.color}`} />
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Project header */}
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${project.color}`} />
              <h3 className="text-base font-bold text-slate-900">
                {project.name}
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-600">{project.description}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
              {open} open
            </span>
            {overdueCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">
                {overdueCount} overdue
              </span>
            )}
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
              {done} done
            </span>
          </div>
        </div>
      </div>

      {/* Date filter */}
      <div className="border-b border-slate-200 bg-white px-5 py-3">
        <DateFilterBar value={filter} onChange={setFilter} />
      </div>

      {/* Tasks */}
      <div className="bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span>{dateFilterLabel(filter)} · tasks</span>
          <span className="text-slate-400">
            {filteredTasks.length} of {tasksForProject.length}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No tasks match this filter.
            <div className="mt-1 text-xs text-slate-400">
              Try widening to “This week” or “All time”.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredTasks.map((t) => (
              <TaskRow key={t.id} task={t} scope={scope} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, scope }: { task: Task; scope: "manager" | "employee" }) {
  const { state, currentUser, updateStatus } = useStore();
  const [expanded, setExpanded] = useState(false);
  const assignee = state.users.find((u) => u.id === task.assigneeId);
  const overdue = isOverdue(task);
  const logs = state.logs
    .filter((l) => l.taskId === task.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const latestLog = logs[0];

  const canEdit =
    scope === "employee" && currentUser?.id === task.assigneeId;

  const deadlineLabel = new Date(task.deadline).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <li className={overdue ? "border-l-4 border-l-red-700 bg-red-50/30" : ""}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full flex-wrap items-start gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
      >
        <span
          className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${
            statusChip[task.status]
          }`}
        >
          {task.status.replace("_", " ")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {task.title}
            </span>
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold capitalize ${
                priorityChip[task.priority]
              }`}
            >
              {task.priority}
            </span>
            {overdue && (
              <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Overdue
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            {assignee?.name ?? "Unassigned"} · due {deadlineLabel}
            {latestLog && (
              <>
                {" · latest log "}
                {relativeTime(latestLog.createdAt)}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {latestLog && <VerdictBadge log={latestLog} />}
          <span className="text-xs text-slate-400">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <p className="text-xs text-slate-700">{task.description}</p>

          {canEdit && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs">
                <span className="block font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </span>
                <select
                  value={task.status}
                  onChange={(e) =>
                    updateStatus(task.id, e.target.value as Status)
                  }
                  className="mt-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold capitalize text-slate-800 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {canEdit && (
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  AI
                </span>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Daily work log
                </h4>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Submit your update — AI verifies it instantly for your manager.
              </p>
              <div className="mt-2">
                <WorkLogForm task={task} />
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <ul className="space-y-2">
              {logs.map((l) => {
                const author = state.users.find((u) => u.id === l.authorId);
                return (
                  <li
                    key={l.id}
                    className="rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-500">
                          {author?.name ?? "Unknown"} · {relativeTime(l.createdAt)}
                        </div>
                        <p className="mt-0.5 text-slate-700">{l.text}</p>
                      </div>
                      <VerdictBadge log={l} />
                    </div>
                    {l.reason && !l.verifying && !l.verificationError && (
                      <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-700">
                        <span className="mr-1 rounded bg-slate-900 px-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          AI
                        </span>
                        {l.reason}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
