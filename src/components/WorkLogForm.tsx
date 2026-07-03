"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { verifyLog } from "@/lib/ai";
import { Task } from "@/lib/types";

export default function WorkLogForm({ task }: { task: Task }) {
  const { submitLog, setVerdict, setVerificationError } = useStore();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    const logId = submitLog(task.id, trimmed);
    setText("");
    try {
      const res = await verifyLog(task, trimmed);
      setVerdict(logId, res.verdict, res.confidence, res.reason);
    } catch {
      setVerificationError(logId);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="What did you do on this task today? Be specific — vague logs get flagged."
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-slate-500">
          Submitting runs an instant AI verification on this log.
        </span>
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit log"}
        </button>
      </div>
    </form>
  );
}
