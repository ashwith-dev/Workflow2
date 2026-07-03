import { Task, Verdict } from "./types";

export interface VerifyResponse {
  verdict: Verdict;
  confidence: number;
  reason: string;
}

export interface SummaryResponse {
  summary: string;
}

export interface SummaryTaskInput {
  title: string;
  projectName: string;
  assigneeName: string;
  status: string;
  priority: string;
  deadline: string;
  overdue: boolean;
  latestLog: string | null;
}

async function unwrap<T>(r: Response, label: string): Promise<T> {
  if (r.ok) return r.json() as Promise<T>;
  let detail = "";
  try {
    const body = await r.json();
    if (body && typeof body.error === "string") detail = body.error;
  } catch {
    // ignore
  }
  throw new Error(detail ? `${label}: ${detail}` : `${label} failed (${r.status})`);
}

export async function verifyLog(task: Task, log: string): Promise<VerifyResponse> {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "verify", payload: { task, log } }),
  });
  return unwrap<VerifyResponse>(r, "AI verify");
}

export async function teamSummary(tasks: SummaryTaskInput[]): Promise<SummaryResponse> {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "summary", payload: { tasks } }),
  });
  return unwrap<SummaryResponse>(r, "AI summary");
}

export interface ReminderResponse {
  subject: string;
  body: string;
}

export interface ReminderInput {
  task: Task;
  recipientName: string;
  projectName: string;
  managerName: string;
  daysOverdue: number;
}

export async function generateReminder(input: ReminderInput): Promise<ReminderResponse> {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "reminder", payload: input }),
  });
  return unwrap<ReminderResponse>(r, "AI reminder");
}

export interface CreateTaskInput {
  prompt: string;
  projects: { id: string; name: string; memberIds: string[] }[];
  users: { id: string; name: string; role: string }[];
  today: string;
}

export interface CreateTaskResponse {
  projectId: string;
  assigneeId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  deadline: string; // ISO
}

export async function createTaskFromPrompt(
  input: CreateTaskInput
): Promise<CreateTaskResponse> {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "create_task", payload: input }),
  });
  return unwrap<CreateTaskResponse>(r, "AI task agent");
}
