import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Local dev TLS workaround: corporate / antivirus proxies often intercept HTTPS
// with a self-signed cert that Node's CA store doesn't trust. In dev only,
// disable verification so the SDK / fetch can reach api.openai.com.
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

function getApiKey() {
  // Accept either env var name so existing .env files keep working.
  const k = process.env.OPENAI_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!k) {
    throw new Error(
      "No API key found. Set OPENAI_API_KEY in .env (or .env.local) and restart the dev server."
    );
  }
  return k;
}

interface OpenAIResponse {
  choices: { message: { content: string | null } }[];
  error?: { message: string };
}

async function callOpenAI(body: object): Promise<string> {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as OpenAIResponse;
  if (!res.ok) {
    throw new Error(data.error?.message ?? `OpenAI HTTP ${res.status}`);
  }
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}

export async function POST(req: NextRequest) {
  let body: { mode?: string; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { mode, payload } = body;

  try {
    if (mode === "verify") {
      const { task, log } = payload as {
        task: { title: string; description: string; priority: string; status: string };
        log: string;
      };
      const system =
        "You audit employee work logs for a task-accountability platform. " +
        "Given a task and the employee's daily log, judge whether the log is genuine, " +
        "vague/low-effort, or mismatched (doesn't relate to the task). " +
        'Respond with ONLY minified JSON: {"verdict":"genuine|vague|mismatch","confidence":0-100,"reason":"one short sentence"}';
      const user =
        `TASK: ${task.title}\nDESCRIPTION: ${task.description}\n` +
        `PRIORITY: ${task.priority}\nSTATUS: ${task.status}\n\nEMPLOYEE LOG: ${log}`;

      const text = await callOpenAI({
        model: MODEL,
        max_tokens: 200,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });

      const clean = text.replace(/```json|```/g, "").trim();
      let parsed: { verdict: string; confidence: number; reason: string };
      try {
        parsed = JSON.parse(clean);
      } catch {
        return NextResponse.json(
          { error: "AI returned non-JSON", raw: text },
          { status: 502 }
        );
      }
      if (!["genuine", "vague", "mismatch"].includes(parsed.verdict)) {
        return NextResponse.json({ error: "invalid verdict", raw: parsed }, { status: 502 });
      }
      const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 0));
      return NextResponse.json({
        verdict: parsed.verdict,
        confidence,
        reason: parsed.reason ?? "",
      });
    }

    if (mode === "create_task") {
      const { prompt, projects, users, today } = payload as {
        prompt: string;
        projects: { id: string; name: string; memberIds: string[] }[];
        users: { id: string; name: string; role: string }[];
        today: string;
      };
      const system =
        "You convert a manager's natural-language instruction into a structured task assignment " +
        "for a project-tracking app. You are given the company's projects (with their employee members) " +
        "and the full list of users. Return ONLY minified JSON: " +
        '{"projectId":"...","assigneeId":"...","title":"...","description":"...","priority":"low|medium|high","deadline":"YYYY-MM-DD"}.\n' +
        "Rules:\n" +
        "- projectId MUST be one of the provided project ids.\n" +
        "- assigneeId MUST be a user that is a member (in memberIds) of that project.\n" +
        "- If the prompt is ambiguous, pick the single most likely match.\n" +
        "- Title is short (<= 80 chars). Description fills in detail the manager didn't say (1-2 sentences).\n" +
        "- Default priority to 'medium' unless the prompt clearly implies otherwise.\n" +
        "- Deadline is an ISO date (YYYY-MM-DD). Resolve relative dates (\"Friday\", \"next week\") relative to TODAY.\n" +
        `- TODAY is ${today}.`;
      const userMsg =
        `PROJECTS:\n${JSON.stringify(projects, null, 2)}\n\n` +
        `USERS:\n${JSON.stringify(users, null, 2)}\n\n` +
        `MANAGER SAID:\n${prompt}`;
      const text = await callOpenAI({
        model: MODEL,
        max_tokens: 350,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      });
      const clean = text.replace(/```json|```/g, "").trim();
      let parsed: {
        projectId: string;
        assigneeId: string;
        title: string;
        description: string;
        priority: string;
        deadline: string;
      };
      try {
        parsed = JSON.parse(clean);
      } catch {
        return NextResponse.json(
          { error: "AI returned non-JSON", raw: text },
          { status: 502 }
        );
      }
      // Server-side validation
      const project = projects.find((p) => p.id === parsed.projectId);
      if (!project) {
        return NextResponse.json(
          {
            error: `AI returned an unknown projectId "${parsed.projectId}". Try rephrasing with an exact project name.`,
          },
          { status: 422 }
        );
      }
      if (!project.memberIds.includes(parsed.assigneeId)) {
        const member = users.find((u) => u.id === parsed.assigneeId);
        return NextResponse.json(
          {
            error: `${
              member?.name ?? "That person"
            } isn't a member of ${project.name}. Pick someone on the project.`,
          },
          { status: 422 }
        );
      }
      if (!["low", "medium", "high"].includes(parsed.priority)) {
        parsed.priority = "medium";
      }
      // Normalize deadline to ISO date string
      const dl = new Date(parsed.deadline);
      if (Number.isNaN(dl.getTime())) {
        return NextResponse.json(
          { error: `AI returned an invalid deadline "${parsed.deadline}".` },
          { status: 422 }
        );
      }
      return NextResponse.json({
        projectId: parsed.projectId,
        assigneeId: parsed.assigneeId,
        title: String(parsed.title ?? "").slice(0, 140),
        description: String(parsed.description ?? ""),
        priority: parsed.priority,
        deadline: dl.toISOString(),
      });
    }

    if (mode === "reminder") {
      const { task, recipientName, projectName, managerName, daysOverdue } =
        payload as {
          task: { title: string; description: string; priority: string; status: string };
          recipientName: string;
          projectName: string;
          managerName: string;
          daysOverdue: number;
        };
      const system =
        "You write short, friendly but firm overdue-task reminder emails on behalf of WorkFlow. " +
        "The tone is professional, never passive-aggressive. Always include: 1 line acknowledging " +
        "the slip without blaming, 1-2 sentences on why the task matters, and a concrete next step. " +
        'Respond with ONLY minified JSON: {"subject":"...","body":"...plain text email body, no markdown, 4-7 lines max, sign off as -- The WorkFlow team..."}';
      const userMsg =
        `RECIPIENT: ${recipientName}\nMANAGER: ${managerName}\nPROJECT: ${projectName}\n` +
        `TASK: ${task.title}\nDESCRIPTION: ${task.description}\nPRIORITY: ${task.priority}\n` +
        `CURRENT STATUS: ${task.status}\nDAYS OVERDUE: ${daysOverdue}`;
      const text = await callOpenAI({
        model: MODEL,
        max_tokens: 350,
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      });
      const clean = text.replace(/```json|```/g, "").trim();
      let parsed: { subject: string; body: string };
      try {
        parsed = JSON.parse(clean);
      } catch {
        return NextResponse.json(
          { error: "AI returned non-JSON", raw: text },
          { status: 502 }
        );
      }
      return NextResponse.json({
        subject: String(parsed.subject ?? "").slice(0, 140),
        body: String(parsed.body ?? ""),
      });
    }

    if (mode === "summary") {
      const { tasks } = payload as { tasks: unknown[] };
      const system =
        "You are a manager's briefing assistant. Turn the task table into a concise plain-English " +
        "status briefing for the manager. Cover: who is behind, what is at risk, which deadlines are " +
        "slipping, and who is quietly overperforming. Use short paragraphs or bullets. Be specific, " +
        "reference names and task titles. Do not invent data.";
      const text = await callOpenAI({
        model: MODEL,
        max_tokens: 600,
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(tasks, null, 2) },
        ],
      });
      return NextResponse.json({ summary: text });
    }

    return NextResponse.json({ error: "unknown mode" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    const cause =
      err instanceof Error && err.cause instanceof Error ? err.cause.message : undefined;
    console.error("[api/ai] failure:", message, cause ?? "");
    return NextResponse.json(
      { error: cause ? `${message} (${cause})` : message },
      { status: 500 }
    );
  }
}
