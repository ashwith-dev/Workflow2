"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Priority } from "@/lib/types";

export default function AssignTaskModal({
  onClose,
  defaultProjectId,
}: {
  onClose: () => void;
  defaultProjectId?: string;
}) {
  const { state, addTask, visibleProjects } = useStore();
  const projects = visibleProjects;

  const [projectId, setProjectId] = useState(
    defaultProjectId ?? projects[0]?.id ?? ""
  );
  const project = projects.find((p) => p.id === projectId);

  // Only employees who are members of the selected project can be assigned.
  const assignableEmployees = useMemo(() => {
    if (!project) return [];
    return state.users.filter(
      (u) => u.role === "employee" && project.memberIds.includes(u.id)
    );
  }, [state.users, project]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(assignableEmployees[0]?.id ?? "");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });

  // Keep assignee valid when the project changes
  if (
    assignableEmployees.length > 0 &&
    !assignableEmployees.some((e) => e.id === assigneeId)
  ) {
    setTimeout(() => setAssigneeId(assignableEmployees[0].id), 0);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assigneeId || !projectId) return;
    addTask({
      projectId,
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      priority,
      deadline: new Date(deadline).toISOString(),
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm wf-fade-in"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="bg-slate-900 px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Assign new task</h2>
          <p className="text-xs text-white/75">
            Pick a project, then an employee on that project.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Project
            </span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ship new pricing page"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="What's the goal? What does done look like?"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Assignee
              </span>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={assignableEmployees.length === 0}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {assignableEmployees.length === 0 ? (
                  <option>No members on this project</option>
                ) : (
                  assignableEmployees.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Priority
              </span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Deadline
            </span>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignableEmployees.length === 0}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Assign task
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
