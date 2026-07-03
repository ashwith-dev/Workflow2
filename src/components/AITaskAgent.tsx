"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { createTaskFromPrompt } from "@/lib/ai";

interface CreatedSummary {
  title: string;
  projectName: string;
  projectColor: string;
  assigneeName: string;
  priority: string;
  deadlineLabel: string;
}

const EXAMPLES = [
  "Ask Arjun to write integration tests for checkout by Friday",
  "Meera should draft the September pricing-page copy this week",
  "Get Karan to audit IAM roles for the platform team by next Tuesday — high priority",
];

export default function AITaskAgent() {
  const { state, dispatch } = useStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedSummary | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setCreated(null);

    try {
      const result = await createTaskFromPrompt({
        prompt: prompt.trim(),
        projects: state.projects.map((p) => ({
          id: p.id,
          name: p.name,
          memberIds: p.memberIds,
        })),
        users: state.users.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
        })),
        today: new Date().toISOString().slice(0, 10),
      });

      // Create it on the client store
      dispatch({
        type: "ADD_TASK",
        task: {
          projectId: result.projectId,
          assigneeId: result.assigneeId,
          title: result.title,
          description: result.description,
          priority: result.priority,
          deadline: result.deadline,
        },
      });

      const project = state.projects.find((p) => p.id === result.projectId);
      const assignee = state.users.find((u) => u.id === result.assigneeId);
      setCreated({
        title: result.title,
        projectName: project?.name ?? "Unknown project",
        projectColor: project?.color ?? "bg-slate-800",
        assigneeName: assignee?.name ?? "Unknown",
        priority: result.priority,
        deadlineLabel: new Date(result.deadline).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Task agent failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="wf-card-hover overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            AI
          </span>
          <div>
            <h2 className="text-base font-bold">Task agent</h2>
            <p className="text-[11px] text-white/75">
              Tell me who, what, which project, and when — I&apos;ll create the task.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 bg-white p-5">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder='e.g. "Ask Arjun to refactor the checkout retries logic on Checkout v2 by next Friday — high priority"'
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Try:
            </span>
            {EXAMPLES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setPrompt(e)}
                className="rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
              >
                {e.length > 40 ? e.slice(0, 40) + "…" : e}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Thinking…" : "Create task"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {created && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm wf-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                ✓ Created
              </span>
              <span className="font-bold text-slate-900">{created.title}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${created.projectColor}`}
              >
                {created.projectName}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-600">
              Assigned to{" "}
              <span className="font-semibold text-slate-800">
                {created.assigneeName}
              </span>{" "}
              · priority{" "}
              <span className="font-semibold capitalize text-slate-800">
                {created.priority}
              </span>{" "}
              · due{" "}
              <span className="font-semibold text-slate-800">
                {created.deadlineLabel}
              </span>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
