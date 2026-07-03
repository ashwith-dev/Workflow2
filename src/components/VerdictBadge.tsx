"use client";

import { WorkLog } from "@/lib/types";

const styles: Record<string, string> = {
  genuine: "bg-emerald-700 text-white border-emerald-800",
  vague: "bg-amber-600 text-white border-amber-700",
  mismatch: "bg-red-700 text-white border-red-800",
};

const labels: Record<string, string> = {
  genuine: "Genuine",
  vague: "Vague",
  mismatch: "Mismatch",
};

const icons: Record<string, string> = {
  genuine: "✓",
  vague: "!",
  mismatch: "×",
};

export default function VerdictBadge({ log }: { log: WorkLog }) {
  if (log.verifying) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500" />
        AI verifying…
      </span>
    );
  }
  if (log.verificationError) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
        Verification unavailable
      </span>
    );
  }
  if (!log.verdict) return null;

  const cls = styles[log.verdict] ?? styles.vague;
  return (
    <span
      title={log.reason ?? ""}
      className={`inline-flex cursor-help items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold wf-fade-in ${cls}`}
    >
      <span className="text-sm leading-none">{icons[log.verdict]}</span>
      {labels[log.verdict]} · {log.confidence ?? 0}%
      <span className="ml-1 rounded bg-white/20 px-1 text-[10px] font-bold uppercase tracking-wide">
        AI
      </span>
    </span>
  );
}
