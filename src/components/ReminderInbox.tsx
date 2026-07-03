"use client";

import { useState, useMemo } from "react";
import { useStore, relativeTime } from "@/lib/store";
import { Reminder } from "@/lib/types";

export default function ReminderInbox({
  scope,
}: {
  scope: "manager" | "employee";
}) {
  const { state, currentUser, markReminderRead, sendOverdueReminders } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [sendingNow, setSendingNow] = useState(false);
  const [expanded, setExpanded] = useState(scope === "employee");

  const reminders = useMemo<Reminder[]>(() => {
    if (!currentUser) return [];
    if (scope === "employee") {
      return state.reminders
        .filter((r) => r.recipientId === currentUser.id)
        .sort(
          (a, b) =>
            new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
    }
    return [...state.reminders].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }, [state.reminders, currentUser, scope]);

  if (!currentUser) return null;

  const unreadCount =
    scope === "employee"
      ? reminders.filter((r) => !r.readAt).length
      : 0;

  const heading =
    scope === "employee" ? "Your inbox" : "Auto-reminder log";
  const subhead =
    scope === "employee"
      ? "Automatic emails sent to you when a task is overdue."
      : "Every overdue-task reminder the system has emailed an employee.";

  function toggle(r: Reminder) {
    if (openId === r.id) {
      setOpenId(null);
      return;
    }
    setOpenId(r.id);
    if (scope === "employee" && !r.readAt) {
      markReminderRead(r.id);
    }
  }

  async function sendNow() {
    setSendingNow(true);
    try {
      await sendOverdueReminders();
    } finally {
      setSendingNow(false);
    }
  }

  const accent = scope === "employee" ? "bg-emerald-700" : "bg-slate-900";

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm wf-fade-in">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3 text-white ${
          expanded ? accent : "bg-slate-700"
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Auto-emails
          </span>
          <div>
            <h2 className="text-sm font-bold">{heading}</h2>
            {expanded && (
              <p className="text-[11px] text-white/75">{subhead}</p>
            )}
          </div>
          <span className="ml-2 text-xs text-white/80">{expanded ? "▲" : "▼"}</span>
        </button>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-red-700 shadow-sm">
              {unreadCount} new
            </span>
          )}
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white">
            {reminders.length} sent
          </span>
          {scope === "manager" && expanded && (
            <button
              onClick={sendNow}
              disabled={sendingNow}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              title="Scan overdue tasks now and email anyone behind"
            >
              {sendingNow ? "Sending…" : "Send overdue now"}
            </button>
          )}
        </div>
      </div>

      {expanded && (
      <div className="bg-white">
        {reminders.length === 0 ? (
          <p className="p-5 text-sm italic text-slate-400">
            {scope === "employee"
              ? "No reminders yet — you're on top of your work."
              : "No reminders sent yet. They'll appear here automatically when tasks go overdue."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {reminders.slice(0, 8).map((r) => {
              const recipient = state.users.find((u) => u.id === r.recipientId);
              const project = state.projects.find((p) => p.id === r.projectId);
              const task = state.tasks.find((t) => t.id === r.taskId);
              const isOpen = openId === r.id;
              const unread = scope === "employee" && !r.readAt;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => toggle(r)}
                    className={`flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50 ${
                      unread ? "bg-amber-50/60" : ""
                    }`}
                  >
                    {unread && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-red-700" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`truncate text-sm ${
                            unread ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                          }`}
                        >
                          {r.subject}
                        </span>
                        {project && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${project.color}`}
                          >
                            {project.name}
                          </span>
                        )}
                        {r.source === "ai" ? (
                          <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            AI
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Template
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        To:{" "}
                        <span className="font-medium text-slate-700">
                          {recipient?.name ?? r.recipientEmail}
                        </span>{" "}
                        &lt;{r.recipientEmail}&gt; · {relativeTime(r.sentAt)} ·{" "}
                        <span className="capitalize">{r.mode}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                      <div className="space-y-0.5 text-[11px] text-slate-500">
                        <div>
                          <span className="font-semibold">From:</span>{" "}
                          reminders@workflow.in
                        </div>
                        <div>
                          <span className="font-semibold">To:</span>{" "}
                          {r.recipientEmail}
                        </div>
                        <div>
                          <span className="font-semibold">Subject:</span>{" "}
                          {r.subject}
                        </div>
                        {task && (
                          <div>
                            <span className="font-semibold">Task:</span>{" "}
                            {task.title}
                          </div>
                        )}
                      </div>
                      <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-3 font-sans text-sm leading-relaxed text-slate-800">
                        {r.body}
                      </pre>
                      <p className="mt-2 text-[10px] uppercase tracking-wider text-slate-400">
                        ⚙️ Simulated send for demo — wire up Resend / SES to
                        deliver for real.
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      )}
    </section>
  );
}
