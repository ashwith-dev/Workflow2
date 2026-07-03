"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import {
  AppState,
  AuditEntry,
  Task,
  WorkLog,
  Status,
  Verdict,
  Priority,
  Project,
  User,
  Reminder,
} from "./types";
import { seedState, DEMO_PASSWORD } from "./seed";
import { generateReminder } from "./ai";

const STORAGE_KEY = "workflow.state.v2"; // bumped because the schema changed

type Action =
  | { type: "ADD_TASK"; task: Omit<Task, "id" | "createdAt" | "status"> }
  | { type: "UPDATE_STATUS"; taskId: string; status: Status; actorId: string }
  | { type: "ADD_LOG"; taskId: string; text: string; authorId: string; logId: string }
  | {
      type: "SET_VERDICT";
      logId: string;
      verdict: Verdict;
      confidence: number;
      reason: string;
    }
  | { type: "SET_VERIFICATION_ERROR"; logId: string }
  | { type: "ADD_REMINDER"; reminder: Reminder }
  | { type: "MARK_REMINDER_READ"; reminderId: string }
  | { type: "LOGIN"; userId: string }
  | { type: "LOGOUT" }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: AppState };

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-3)}`;
}

function userName(state: AppState, userId: string) {
  return state.users.find((u) => u.id === userId)?.name ?? "Unknown";
}

function taskById(state: AppState, taskId: string) {
  return state.tasks.find((t) => t.id === taskId);
}

function appendAudit(state: AppState, entry: AuditEntry): AppState {
  return { ...state, audit: [entry, ...state.audit] };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "RESET":
      return seedState;
    case "LOGIN":
      return { ...state, currentUserId: action.userId };
    case "LOGOUT":
      return { ...state, currentUserId: null };
    case "ADD_TASK": {
      const id = uid("t");
      const createdAt = new Date().toISOString();
      const task: Task = { ...action.task, id, createdAt, status: "todo" };
      const next: AppState = { ...state, tasks: [...state.tasks, task] };
      const project = state.projects.find((p) => p.id === task.projectId);
      return appendAudit(next, {
        id: uid("a"),
        actorId: state.currentUserId ?? "system",
        action: `assigned task "${task.title}" to ${userName(state, task.assigneeId)}${
          project ? ` in ${project.name}` : ""
        }`,
        taskId: id,
        projectId: task.projectId,
        at: createdAt,
      });
    }
    case "UPDATE_STATUS": {
      const tasks = state.tasks.map((t) =>
        t.id === action.taskId ? { ...t, status: action.status } : t
      );
      const next = { ...state, tasks };
      const original = taskById(state, action.taskId);
      return appendAudit(next, {
        id: uid("a"),
        actorId: action.actorId,
        action: `changed status to ${action.status.replace("_", " ")} on "${
          original?.title ?? "a task"
        }"`,
        taskId: action.taskId,
        projectId: original?.projectId,
        at: new Date().toISOString(),
      });
    }
    case "ADD_LOG": {
      const log: WorkLog = {
        id: action.logId,
        taskId: action.taskId,
        authorId: action.authorId,
        text: action.text,
        createdAt: new Date().toISOString(),
        verifying: true,
      };
      const next: AppState = { ...state, logs: [log, ...state.logs] };
      const original = taskById(state, action.taskId);
      return appendAudit(next, {
        id: uid("a"),
        actorId: action.authorId,
        action: `submitted work log on "${original?.title ?? "a task"}"`,
        taskId: action.taskId,
        projectId: original?.projectId,
        at: log.createdAt,
      });
    }
    case "SET_VERDICT": {
      const logs = state.logs.map((l) =>
        l.id === action.logId
          ? {
              ...l,
              verdict: action.verdict,
              confidence: action.confidence,
              reason: action.reason,
              verifying: false,
              verificationError: false,
            }
          : l
      );
      return { ...state, logs };
    }
    case "SET_VERIFICATION_ERROR": {
      const logs = state.logs.map((l) =>
        l.id === action.logId
          ? { ...l, verifying: false, verificationError: true }
          : l
      );
      return { ...state, logs };
    }
    case "ADD_REMINDER": {
      const r = action.reminder;
      const next: AppState = { ...state, reminders: [r, ...state.reminders] };
      const task = taskById(state, r.taskId);
      return appendAudit(next, {
        id: uid("a"),
        actorId: "system",
        action: `auto-emailed an overdue reminder to ${
          state.users.find((u) => u.id === r.recipientId)?.name ?? r.recipientEmail
        } about "${task?.title ?? "a task"}"`,
        taskId: r.taskId,
        projectId: r.projectId,
        at: r.sentAt,
      });
    }
    case "MARK_REMINDER_READ": {
      const reminders = state.reminders.map((r) =>
        r.id === action.reminderId && !r.readAt
          ? { ...r, readAt: new Date().toISOString() }
          : r
      );
      return { ...state, reminders };
    }
    default:
      return state;
  }
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentUser: User | null;
  visibleProjects: Project[];
  canAccessProject: (projectId: string) => boolean;
  addTask: (input: {
    projectId: string;
    title: string;
    description: string;
    assigneeId: string;
    priority: Priority;
    deadline: string;
  }) => void;
  updateStatus: (taskId: string, status: Status) => void;
  submitLog: (taskId: string, text: string) => string;
  setVerdict: (
    logId: string,
    verdict: Verdict,
    confidence: number,
    reason: string
  ) => void;
  setVerificationError: (logId: string) => void;
  sendOverdueReminders: () => Promise<number>;
  markReminderRead: (reminderId: string) => void;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
  resetState: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// Templated reminder used when the AI call fails — keeps the feature working
// even when offline / out of credits.
function templateReminder(args: {
  task: Task;
  recipientName: string;
  projectName: string;
  managerName: string;
  daysOverdue: number;
}) {
  const { task, recipientName, projectName, managerName, daysOverdue } = args;
  const dueDate = new Date(task.deadline).toLocaleDateString();
  const subject = `⚠️ Overdue: "${task.title}" — ${daysOverdue}d past due`;
  const body =
    `Hi ${recipientName},\n\n` +
    `This is an automated nudge — your task "${task.title}" on the ${projectName} ` +
    `project was due on ${dueDate} and is still marked ${task.status.replace("_", " ")}. ` +
    `It's been ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} now.\n\n` +
    `Please either move it forward or submit a quick work log explaining the blocker — ` +
    `the AI will verify it instantly so ${managerName} doesn't need to chase you.\n\n` +
    `— The WorkFlow team`;
  return { subject, body };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, seedState);
  const [mounted, setMounted] = useState(false);
  // Avoid re-sending the same reminder during a single session.
  const inFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed && parsed.tasks && parsed.users && parsed.projects) {
          // Backfill reminders for older saved state.
          if (!parsed.reminders) parsed.reminders = [];
          dispatch({ type: "HYDRATE", state: parsed });
        }
      }
    } catch {
      // ignore — keep seed
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full / disabled — non-fatal
    }
  }, [state]);

  const currentUser = useMemo(
    () =>
      state.currentUserId
        ? state.users.find((u) => u.id === state.currentUserId) ?? null
        : null,
    [state.users, state.currentUserId]
  );

  const visibleProjects = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "manager") return state.projects;
    return state.projects.filter((p) => p.memberIds.includes(currentUser.id));
  }, [state.projects, currentUser]);

  const canAccessProject = useMemo(() => {
    const ids = new Set(visibleProjects.map((p) => p.id));
    return (projectId: string) => ids.has(projectId);
  }, [visibleProjects]);

  // Send overdue reminders. Returns the number of reminders sent.
  // Dedups by taskId — at most one reminder per task per 24h.
  const sendOverdueReminders = useCallback(async (): Promise<number> => {
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const manager = state.users.find((u) => u.role === "manager");
    const managerName = manager?.name ?? "your manager";

    const due = state.tasks.filter((t) => {
      if (t.status === "done") return false;
      const overdue = new Date(t.deadline).getTime() < now;
      if (!overdue) return false;
      // already reminded within last 24h?
      const recent = state.reminders.find(
        (r) =>
          r.taskId === t.id &&
          now - new Date(r.sentAt).getTime() < day
      );
      if (recent) return false;
      if (inFlightRef.current.has(t.id)) return false;
      return true;
    });

    if (due.length === 0) return 0;

    let sent = 0;
    for (const task of due) {
      const recipient = state.users.find((u) => u.id === task.assigneeId);
      const project = state.projects.find((p) => p.id === task.projectId);
      if (!recipient || !project) continue;
      inFlightRef.current.add(task.id);

      const daysOverdue = Math.max(
        1,
        Math.round((now - new Date(task.deadline).getTime()) / day)
      );

      let subject = "";
      let body = "";
      let source: "ai" | "template" = "ai";
      try {
        const ai = await generateReminder({
          task,
          recipientName: recipient.name,
          projectName: project.name,
          managerName,
          daysOverdue,
        });
        subject = ai.subject;
        body = ai.body;
      } catch {
        source = "template";
        const t = templateReminder({
          task,
          recipientName: recipient.name,
          projectName: project.name,
          managerName,
          daysOverdue,
        });
        subject = t.subject;
        body = t.body;
      }

      const reminder: Reminder = {
        id: uid("rm"),
        taskId: task.id,
        projectId: task.projectId,
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        subject,
        body,
        sentAt: new Date().toISOString(),
        mode: "simulated",
        source,
      };
      dispatch({ type: "ADD_REMINDER", reminder });
      sent += 1;
      inFlightRef.current.delete(task.id);
    }
    return sent;
  }, [state.tasks, state.reminders, state.users, state.projects]);

  // Auto-scan after login: fire once, then every 60s while the user is signed in.
  useEffect(() => {
    if (!state.currentUserId) return;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      sendOverdueReminders().catch(() => {});
    };
    const initial = setTimeout(run, 1200); // small delay so the UI paints first
    const interval = setInterval(run, 60_000);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [state.currentUserId, sendOverdueReminders]);

  const value: StoreContextValue = useMemo(
    () => ({
      state,
      dispatch,
      currentUser,
      visibleProjects,
      canAccessProject,
      addTask: (input) => dispatch({ type: "ADD_TASK", task: input }),
      updateStatus: (taskId, status) => {
        if (!state.currentUserId) return;
        dispatch({
          type: "UPDATE_STATUS",
          taskId,
          status,
          actorId: state.currentUserId,
        });
      },
      submitLog: (taskId, text) => {
        if (!state.currentUserId) return "";
        const logId = uid("l");
        dispatch({
          type: "ADD_LOG",
          taskId,
          text,
          authorId: state.currentUserId,
          logId,
        });
        return logId;
      },
      setVerdict: (logId, verdict, confidence, reason) =>
        dispatch({ type: "SET_VERDICT", logId, verdict, confidence, reason }),
      setVerificationError: (logId) =>
        dispatch({ type: "SET_VERIFICATION_ERROR", logId }),
      sendOverdueReminders,
      markReminderRead: (reminderId) =>
        dispatch({ type: "MARK_REMINDER_READ", reminderId }),
      login: (email, password) => {
        const normalized = email.trim().toLowerCase();
        const user = state.users.find(
          (u) => u.email.toLowerCase() === normalized
        );
        if (!user) {
          return { ok: false, error: "No account found with that email." };
        }
        if (password !== DEMO_PASSWORD) {
          return { ok: false, error: "Incorrect password." };
        }
        dispatch({ type: "LOGIN", userId: user.id });
        return { ok: true };
      },
      logout: () => dispatch({ type: "LOGOUT" }),
      resetState: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        dispatch({ type: "RESET" });
      },
    }),
    [state, currentUser, visibleProjects, canAccessProject, sendOverdueReminders]
  );

  return (
    <StoreContext.Provider value={value}>
      {mounted ? (
        children
      ) : (
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">
          Loading WorkFlow…
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function isOverdue(task: Task) {
  return new Date(task.deadline).getTime() < Date.now() && task.status !== "done";
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const sign = diff >= 0 ? "ago" : "from now";
  if (abs < minute) return "just now";
  if (abs < hour) return `${Math.round(abs / minute)}m ${sign}`;
  if (abs < day) return `${Math.round(abs / hour)}h ${sign}`;
  return `${Math.round(abs / day)}d ${sign}`;
}
