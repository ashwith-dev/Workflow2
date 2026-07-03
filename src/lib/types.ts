export type Role = "manager" | "employee";
export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "blocked" | "done";
export type Verdict = "genuine" | "vague" | "mismatch";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  memberIds: string[]; // employee user ids only — manager has access to all
  color: string;       // solid tailwind bg class for project accent, e.g. "bg-blue-800"
  createdAt: string;
}

export interface WorkLog {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: string;
  verdict?: Verdict;
  confidence?: number;
  reason?: string;
  verifying?: boolean;
  verificationError?: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: Priority;
  deadline: string;
  status: Status;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  taskId?: string;
  projectId?: string;
  at: string;
}

export interface Reminder {
  id: string;
  taskId: string;
  projectId: string;
  recipientId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  mode: "simulated" | "delivered";
  source: "ai" | "template";
  readAt?: string;
}

export interface AppState {
  users: User[];
  projects: Project[];
  tasks: Task[];
  logs: WorkLog[];
  audit: AuditEntry[];
  reminders: Reminder[];
  currentUserId: string | null; // null when logged out
}
