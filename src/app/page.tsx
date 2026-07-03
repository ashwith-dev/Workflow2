"use client";

import { useStore } from "@/lib/store";
import RoleSwitcher from "@/components/RoleSwitcher";
import ManagerDashboard from "@/components/ManagerDashboard";
import EmployeeView from "@/components/EmployeeView";
import AuditTrailDropdown from "@/components/AuditTrailDropdown";
import LoginScreen from "@/components/LoginScreen";

export default function Home() {
  const { currentUser } = useStore();

  if (!currentUser) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <LoginScreen />
      </div>
    );
  }

  const isManager = currentUser.role === "manager";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white shadow-sm">
            <span className="text-base font-extrabold">W</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
              WorkFlow
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              AI-verified task accountability
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AuditTrailDropdown />
          <RoleSwitcher />
        </div>
      </header>

      <div
        className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-5 py-3 shadow-sm wf-fade-in ${
          isManager
            ? "border-l-4 border-l-slate-900 border-slate-200"
            : "border-l-4 border-l-emerald-700 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white ${
              isManager ? "bg-slate-900" : "bg-emerald-700"
            }`}
          >
            {isManager ? "Manager mode" : "Employee mode"}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900">
              {isManager
                ? `Welcome back, ${currentUser.name}`
                : `Hi ${currentUser.name} — your projects are below`}
            </h2>
            <p className="text-[11px] text-slate-600">
              {isManager
                ? "Manage every project. Filter by date inside any project. Each work log is auto-verified by AI."
                : "Pick a project, filter by date, update status, and submit a daily log. AI verifies it for your manager."}
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {isManager ? <ManagerDashboard /> : <EmployeeView />}
      </main>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
        Built with Next.js · OpenAI · Tailwind · Data persists in localStorage.
      </footer>
    </div>
  );
}
