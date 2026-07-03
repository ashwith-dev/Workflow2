"use client";

import { Task } from "@/lib/types";

export type DateFilter =
  | "today"
  | "yesterday"
  | "tomorrow"
  | "thisweek"
  | "overdue"
  | "all"
  | "custom";

export interface DateFilterValue {
  kind: DateFilter;
  customDate?: string; // YYYY-MM-DD when kind === "custom"
}

const day = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function filterTasksByDate(tasks: Task[], v: DateFilterValue): Task[] {
  if (v.kind === "all") return tasks;
  const today = startOfDay(new Date());

  return tasks.filter((t) => {
    const td = startOfDay(new Date(t.deadline));
    switch (v.kind) {
      case "today":
        return td.getTime() === today.getTime();
      case "yesterday":
        return td.getTime() === today.getTime() - day;
      case "tomorrow":
        return td.getTime() === today.getTime() + day;
      case "thisweek":
        return td.getTime() >= today.getTime() && td.getTime() < today.getTime() + 7 * day;
      case "overdue":
        return td.getTime() < today.getTime() && t.status !== "done";
      case "custom": {
        if (!v.customDate) return true;
        const c = startOfDay(new Date(v.customDate));
        return td.getTime() === c.getTime();
      }
      default:
        return true;
    }
  });
}

export function dateFilterLabel(v: DateFilterValue): string {
  switch (v.kind) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "tomorrow":
      return "Tomorrow";
    case "thisweek":
      return "This week";
    case "overdue":
      return "Overdue";
    case "all":
      return "All time";
    case "custom":
      return v.customDate
        ? new Date(v.customDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Custom date";
  }
}

const CHIPS: { kind: DateFilter; label: string }[] = [
  { kind: "today", label: "Today" },
  { kind: "yesterday", label: "Yesterday" },
  { kind: "tomorrow", label: "Tomorrow" },
  { kind: "thisweek", label: "This week" },
  { kind: "overdue", label: "Overdue" },
  { kind: "all", label: "All time" },
];

export default function DateFilterBar({
  value,
  onChange,
}: {
  value: DateFilterValue;
  onChange: (v: DateFilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Show
      </span>
      {CHIPS.map((c) => {
        const active = value.kind === c.kind;
        return (
          <button
            key={c.kind}
            type="button"
            onClick={() => onChange({ kind: c.kind })}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
            }`}
          >
            {c.label}
          </button>
        );
      })}
      <div className="flex items-center gap-1">
        <label className="text-[11px] font-medium text-slate-500">On:</label>
        <input
          type="date"
          value={value.kind === "custom" ? value.customDate ?? "" : ""}
          onChange={(e) =>
            onChange({ kind: "custom", customDate: e.target.value })
          }
          className={`rounded-md border px-2 py-1 text-xs ${
            value.kind === "custom"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-700"
          } focus:outline-none focus:ring-2 focus:ring-slate-200`}
        />
      </div>
    </div>
  );
}
