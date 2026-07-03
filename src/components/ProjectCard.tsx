"use client";

import { useStore, isOverdue } from "@/lib/store";
import { Project } from "@/lib/types";

export default function ProjectCard({
  project,
  selected,
  onClick,
}: {
  project: Project;
  selected: boolean;
  onClick: () => void;
}) {
  const { state } = useStore();
  const projectTasks = state.tasks.filter((t) => t.projectId === project.id);
  const open = projectTasks.filter((t) => t.status !== "done").length;
  const overdue = projectTasks.filter(isOverdue).length;
  const done = projectTasks.length - open;
  const members = state.users.filter((u) => project.memberIds.includes(u.id));

  return (
    <button
      type="button"
      onClick={onClick}
      className={`wf-card-hover group overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:border-slate-400 ${
        selected ? "border-slate-900 ring-2 ring-slate-900/20" : "border-slate-200"
      }`}
    >
      <div className={`h-1.5 w-full ${project.color}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">
              {project.name}
            </div>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
              {project.description}
            </p>
          </div>
          {overdue > 0 && (
            <span className="shrink-0 rounded bg-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {overdue} overdue
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <span
                key={m.id}
                title={m.name}
                className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-slate-800 text-[10px] font-bold text-white shadow-sm"
              >
                {m.name.charAt(0)}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
              {open} open
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
              {done} done
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
