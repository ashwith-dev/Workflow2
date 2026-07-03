"use client";

import { Task, WorkLog } from "@/lib/types";
import { isOverdue, useStore, relativeTime } from "@/lib/store";
import VerdictBadge from "./VerdictBadge";

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const statusStyles: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  blocked: "bg-amber-100 text-amber-800 border-amber-200",
  done: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

function statusLabel(s: string) {
  return s.replace("_", " ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const aiCommentStyles: Record<string, string> = {
  genuine: "border-emerald-200 bg-emerald-50 text-emerald-900",
  vague: "border-amber-200 bg-amber-50 text-amber-900",
  mismatch: "border-red-200 bg-red-50 text-red-900",
};

function AICommentBlock({ log }: { log: WorkLog }) {
  if (log.verifying) {
    return (
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500" />
        Claude is reviewing this log…
      </div>
    );
  }
  if (log.verificationError) {
    return (
      <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] italic text-slate-500">
        AI verification unavailable — log was saved.
      </div>
    );
  }
  if (!log.verdict || !log.reason) return null;
  return (
    <div
      className={`mt-1 flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] leading-relaxed wf-fade-in ${
        aiCommentStyles[log.verdict] ?? aiCommentStyles.vague
      }`}
    >
      <span className="mt-px rounded bg-white/70 px-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
        AI
      </span>
      <span className="font-medium">{log.reason}</span>
    </div>
  );
}

export default function TaskTable({ tasks }: { tasks: Task[] }) {
  const { state } = useStore();

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No tasks match this filter yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm wf-card-hover">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <tr>
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Assignee</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Deadline</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Latest log + AI verdict</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((t) => {
            const overdue = isOverdue(t);
            const assignee = state.users.find((u) => u.id === t.assigneeId);
            const latestLog = state.logs
              .filter((l) => l.taskId === t.id)
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0];
            return (
              <tr
                key={t.id}
                className={`transition hover:bg-slate-50 ${
                  overdue ? "border-l-4 border-l-red-700 bg-red-50/40" : ""
                }`}
              >
                <td className="px-4 py-3 align-top">
                  <div className="font-semibold text-slate-900">{t.title}</div>
                  <div className="mt-0.5 line-clamp-1 max-w-xs text-xs text-slate-500">
                    {t.description}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  {(() => {
                    const proj = state.projects.find((p) => p.id === t.projectId);
                    if (!proj) return <span className="text-xs text-slate-400">—</span>;
                    return (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm ${proj.color}`}
                      >
                        {proj.name}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-xs font-bold text-white shadow-sm">
                      {assignee?.name.charAt(0) ?? "?"}
                    </span>
                    <span className="font-medium text-slate-700">
                      {assignee?.name ?? "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${
                      priorityStyles[t.priority]
                    }`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        overdue
                          ? "font-bold text-red-700"
                          : "text-slate-700"
                      }
                    >
                      {formatDate(t.deadline)}
                    </span>
                    {overdue && (
                      <span className="rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Overdue
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${
                      statusStyles[t.status]
                    }`}
                  >
                    {statusLabel(t.status)}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  {latestLog ? (
                    <div className="max-w-md space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-300">“</span>
                        <p className="line-clamp-2 text-xs text-slate-700">
                          {latestLog.text}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <VerdictBadge log={latestLog} />
                        <span>{relativeTime(latestLog.createdAt)}</span>
                      </div>
                      <AICommentBlock log={latestLog} />
                    </div>
                  ) : (
                    <span className="text-xs italic text-slate-400">No logs yet</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
