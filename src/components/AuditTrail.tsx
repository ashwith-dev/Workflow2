"use client";

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

export default function AuditTrail() {
  const { state, currentUser, canAccessProject } = useStore();
  if (!currentUser) return null;
  const isManager = currentUser.role === "manager";

  const entries = state.audit
    .filter((e) => {
      if (isManager) return true;
      if (e.actorId !== currentUser.id) return false;
      if (e.projectId && !canAccessProject(e.projectId)) return false;
      return true;
    })
    .slice(0, 60);

  const heading = isManager ? "Audit trail" : "My activity";
  const subhead = isManager
    ? "Every status change, work log, and assignment — across the team."
    : "Your own status changes and logs on projects you're a member of.";

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${
            isManager ? "bg-slate-900" : "bg-emerald-700"
          }`}
        >
          {isManager ? "Log" : "You"}
        </span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          {heading}
        </h2>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{subhead}</p>

      {entries.length === 0 ? (
        <p className="mt-4 text-sm italic text-slate-400">
          {isManager ? "No activity yet." : "You haven't made any updates yet."}
        </p>
      ) : (
        <ul className="wf-thin-scroll mt-4 max-h-[34rem] space-y-2 overflow-y-auto pr-2">
          {entries.map((e) => {
            const actor = state.users.find((u) => u.id === e.actorId);
            const project = e.projectId
              ? state.projects.find((p) => p.id === e.projectId)
              : null;
            return (
              <li
                key={e.id}
                className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-2.5 text-sm shadow-sm wf-fade-in"
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
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
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
    </aside>
  );
}
