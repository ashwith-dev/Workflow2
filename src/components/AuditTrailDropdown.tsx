"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useStore, relativeTime } from "@/lib/store";

const actorColors = [
  "bg-slate-800",
  "bg-emerald-700",
  "bg-blue-700",
  "bg-amber-700",
  "bg-rose-700",
];

function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return actorColors[h % actorColors.length];
}

export default function AuditTrailDropdown() {
  const { state, currentUser, canAccessProject } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const entries = useMemo(() => {
    if (!currentUser) return [];
    const isManager = currentUser.role === "manager";
    return state.audit
      .filter((e) => {
        if (isManager) return true;
        if (e.actorId !== currentUser.id) return false;
        if (e.projectId && !canAccessProject(e.projectId)) return false;
        return true;
      })
      .slice(0, 60);
  }, [state.audit, currentUser, canAccessProject]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!currentUser) return null;
  const isManager = currentUser.role === "manager";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 ${
          open ? "border-slate-900" : ""
        }`}
      >
        <span className="grid h-5 w-5 place-items-center rounded bg-slate-900 text-[10px] font-bold text-white">
          {isManager ? "L" : "Y"}
        </span>
        <span>Activity</span>
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
          {entries.length}
        </span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[22rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl wf-fade-in">
          <div className="border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <h2 className="text-sm font-bold">
              {isManager ? "Audit trail" : "My activity"}
            </h2>
            <p className="mt-0.5 text-[11px] text-white/75">
              {isManager
                ? "Every status change, work log, and assignment — across the team."
                : "Your own status changes and logs on projects you're a member of."}
            </p>
          </div>

          {entries.length === 0 ? (
            <p className="p-5 text-sm italic text-slate-400">
              {isManager
                ? "No activity yet."
                : "You haven't made any updates yet."}
            </p>
          ) : (
            <ul className="wf-thin-scroll max-h-[26rem] divide-y divide-slate-100 overflow-y-auto">
              {entries.map((e) => {
                const actor = state.users.find((u) => u.id === e.actorId);
                const project = e.projectId
                  ? state.projects.find((p) => p.id === e.projectId)
                  : null;
                return (
                  <li
                    key={e.id}
                    className="flex items-start gap-2 px-4 py-2.5"
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white shadow-sm ${colorFor(
                        e.actorId
                      )}`}
                    >
                      {actor?.name.charAt(0) ?? "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-700">
                        <span className="font-bold text-slate-900">
                          {isManager ? actor?.name ?? "Unknown" : "You"}
                        </span>{" "}
                        {e.action}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        <span>{relativeTime(e.at)}</span>
                        {project && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white ${project.color}`}
                          >
                            {project.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
