"use client";

import { useStore } from "@/lib/store";

export default function RoleSwitcher() {
  const { currentUser, logout, resetState } = useStore();
  if (!currentUser) return null;

  const isManager = currentUser.role === "manager";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white shadow-sm ${
            isManager ? "bg-slate-900" : "bg-emerald-700"
          }`}
        >
          {currentUser.name.charAt(0)}
        </span>
        <div className="text-xs leading-tight">
          <div className="font-semibold text-slate-900">
            {currentUser.name}{" "}
            <span
              className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${
                isManager ? "bg-slate-900" : "bg-emerald-700"
              }`}
            >
              {currentUser.role}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">{currentUser.email}</div>
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm("Reset all data back to the seed (you will be logged out)?")) {
            resetState();
          }
        }}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
        title="Reset all data to seed"
      >
        Reset
      </button>

      <button
        onClick={logout}
        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
      >
        Log out
      </button>
    </div>
  );
}
