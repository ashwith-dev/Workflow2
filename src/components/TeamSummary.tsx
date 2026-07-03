"use client";

import { useState } from "react";
import { useStore, isOverdue } from "@/lib/store";
import { teamSummary, SummaryTaskInput } from "@/lib/ai";

export default function TeamSummary({ embedded = false }: { embedded?: boolean }) {
  const { state } = useStore();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const payload: SummaryTaskInput[] = state.tasks.map((t) => {
        const assignee = state.users.find((u) => u.id === t.assigneeId);
        const project = state.projects.find((p) => p.id === t.projectId);
        const latestLog = state.logs.find((l) => l.taskId === t.id);
        return {
          title: t.title,
          projectName: project?.name ?? "Unassigned",
          assigneeName: assignee?.name ?? "Unknown",
          status: t.status,
          priority: t.priority,
          deadline: t.deadline,
          overdue: isOverdue(t),
          latestLog: latestLog?.text ?? null,
        };
      });
      const res = await teamSummary(payload);
      setSummary(res.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  }

  const body = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Click to get a plain-English briefing on who&apos;s behind, what&apos;s at risk, and who&apos;s on track.
        </p>
        <button
          onClick={run}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Briefing…" : summary ? "↻ Refresh briefing" : "Generate briefing"}
        </button>
      </div>

      {loading && (
        <div className="mt-4 space-y-2">
          <div className="wf-shimmer h-3 w-3/4 rounded bg-slate-100" />
          <div className="wf-shimmer h-3 w-full rounded bg-slate-100" />
          <div className="wf-shimmer h-3 w-5/6 rounded bg-slate-100" />
          <div className="wf-shimmer h-3 w-2/3 rounded bg-slate-100" />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !summary && (
        <p className="mt-4 text-sm italic text-slate-500">
          Briefing will appear here once you click generate.
        </p>
      )}

      {summary && !loading && (
        <div className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 wf-fade-in">
          {summary}
        </div>
      )}
    </>
  );

  if (embedded) return <div>{body}</div>;

  return (
    <section className="wf-card-hover overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              AI
            </span>
            <h2 className="text-base font-bold">Where&apos;s My Team?</h2>
          </div>
          <p className="mt-0.5 text-xs text-white/75">
            Plain-English briefing on who&apos;s behind, what&apos;s at risk, and who&apos;s on track.
          </p>
        </div>
      </div>
      <div className="bg-white p-5">{body}</div>
    </section>
  );
}
