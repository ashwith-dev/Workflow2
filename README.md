# WorkFlow

**Role-based employee task & accountability platform with two live AI features.**

WorkFlow lets a manager assign tasks across a team, tracks every status change and work-log in an audit trail, and uses Claude in two specific places where humans waste the most time: spot-checking employee work-logs and reading the full task table to figure out what's actually going on.

---

## The problem

Managers don't read every status update. Employees write low-effort logs ("did some stuff") because they know no one's paying attention. By the time something is visibly behind schedule, the slip already happened.

## The solution

Two AI features, each placed where it cuts the most time:

### AI Feature #1 — Work-log verification (automatic)
When an employee submits a daily work log, the server route calls the LLM and returns a verdict — `genuine`, `vague`, or `mismatch` — with a confidence score and a one-line reason. The manager sees a colored badge next to every log without ever asking anyone "did you actually do this?"

### AI Feature #2 — "Where's My Team?" briefing (one click)
The manager clicks one button on the dashboard. The whole task table — assignees, statuses, deadlines, overdue flags, latest logs — gets sent to the LLM, which returns a plain-English briefing: who's behind, what's at risk, which deadlines are slipping, who's quietly overperforming.

Both features call the LLM from a **server-side route** (`/api/ai`), so the API key never reaches the browser.

> The active backend is **OpenAI** (`gpt-4o-mini`) — the route accepts `OPENAI_API_KEY` in `.env`. A `ANTHROPIC_API_KEY` slot is still honored for backward compatibility (the value is sent to OpenAI), so existing keys keep working without renaming.

---

## What's mocked vs. what's real

Being honest about the demo scope:

| Layer | State |
|---|---|
| Database | **Mocked** — single React Context store, persisted to `localStorage`. |
| Auth | **Mocked** — a "Viewing as" dropdown switches the current user. No passwords. |
| Notifications / email | Not built. |
| AI verification & briefing | **Real** — live calls to OpenAI (`gpt-4o-mini`). |
| Audit trail | **Real** — every mutation appends an entry with actor + timestamp. |
| Overdue detection | **Real** — `deadline < now && status !== "done"`. |

---

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **OpenAI Chat Completions** (`gpt-4o-mini`) called via `fetch` from a server route
- React Context + reducer + `localStorage` for state

---

## How to run

```bash
# 1. Install
cd workflow
npm install

# 2. Add your OpenAI key
cp .env.example .env.local
# then edit .env.local and paste your key after OPENAI_API_KEY=

# 3. Start
npm run dev
```

Open <http://localhost:3000>.

> Get an API key at <https://platform.openai.com/api-keys>.

---

## Try the demo

1. Start as **Priya (manager)**. The dashboard shows the full task table — overdue rows are highlighted in red, and the seed data includes one log ("did some stuff") that Claude will flag.
2. Click **Generate briefing** at the top of the dashboard. Claude reads the table and writes a status summary in plain English.
3. Switch the dropdown to **Meera (employee)**. Open one of her tasks, type a log like "Wrote 3 new sections of the onboarding email and got design review from Karan", and submit. A "Verifying…" badge appears, then turns green (`Genuine · ~90%`) once Claude responds.
4. Submit a vague log ("worked on it") on another task — Claude flags it amber (`Vague`).
5. Switch back to Priya — the manager view now shows the new logs with their verdicts inline.
6. Refresh the page — everything persists via `localStorage`. Hit **Reset** to restore the seed.

---

## Project layout

```
src/
├─ app/
│  ├─ layout.tsx              # Wraps the app in StoreProvider
│  ├─ page.tsx                # Shell: header, role switcher, dashboard/employee view, audit trail
│  └─ api/ai/route.ts         # Server-only Claude calls (verify + summary)
├─ components/
│  ├─ RoleSwitcher.tsx        # "Viewing as" dropdown + Reset
│  ├─ ManagerDashboard.tsx    # Stat cards, filters, table, assign button, AI briefing
│  ├─ EmployeeView.tsx        # My-tasks cards with status + log form
│  ├─ TaskTable.tsx           # Full task grid for manager
│  ├─ AssignTaskModal.tsx     # Create-task modal
│  ├─ WorkLogForm.tsx         # Submit log + fire AI verification
│  ├─ TeamSummary.tsx         # "Where's My Team?" panel (AI #2)
│  ├─ VerdictBadge.tsx        # Color-coded AI verdict pill
│  └─ AuditTrail.tsx          # Side panel of every action
└─ lib/
   ├─ types.ts                # AppState, Task, WorkLog, AuditEntry, etc.
   ├─ seed.ts                 # 4 users + 8 tasks + 3 logs (incl. one obviously vague)
   ├─ store.tsx               # Context + reducer + localStorage hydration
   └─ ai.ts                   # Client fetch helpers for /api/ai
```

---

## License

MIT. Built for a hackathon — go forth and ship.
