import { AppState } from "./types";

const day = 24 * 60 * 60 * 1000;
const now = Date.now();
const iso = (offsetDays: number) =>
  new Date(now + offsetDays * day).toISOString();

// --- Users -----------------------------------------------------------------
// Login emails: <name>@workflow.in. Password for everyone: hrudhay123.
const users = [
  { id: "u_priya", name: "Priya", email: "priya@workflow.in", role: "manager" as const },
  { id: "u_arjun", name: "Arjun", email: "arjun@workflow.in", role: "employee" as const },
  { id: "u_meera", name: "Meera", email: "meera@workflow.in", role: "employee" as const },
  { id: "u_karan", name: "Karan", email: "karan@workflow.in", role: "employee" as const },
  { id: "u_riya", name: "Riya", email: "riya@workflow.in", role: "employee" as const },
  { id: "u_vikram", name: "Vikram", email: "vikram@workflow.in", role: "employee" as const },
  { id: "u_sneha", name: "Sneha", email: "sneha@workflow.in", role: "employee" as const },
  { id: "u_dev", name: "Dev", email: "dev@workflow.in", role: "employee" as const },
  { id: "u_ananya", name: "Ananya", email: "ananya@workflow.in", role: "employee" as const },
];

// --- Projects --------------------------------------------------------------
// Each employee is on 2–3 projects.
//   Arjun  → Checkout v2, Marketing Q3, Annual Planning
//   Meera  → Marketing Q3, Security & Infra, Annual Planning
//   Karan  → Checkout v2, Security & Infra, Annual Planning
//   Riya   → Checkout v2, Marketing Q3
//   Vikram → Security & Infra, Annual Planning, Checkout v2
//   Sneha  → Marketing Q3, Annual Planning
//   Dev    → Checkout v2, Security & Infra
//   Ananya → Marketing Q3, Security & Infra, Annual Planning
const projects = [
  {
    id: "p_checkout",
    name: "Checkout v2 API",
    description:
      "Re-platform the checkout flow with idempotency, structured errors, and a public OpenAPI spec.",
    memberIds: ["u_arjun", "u_karan", "u_riya", "u_vikram", "u_dev"],
    color: "bg-blue-800",
    createdAt: iso(-30),
  },
  {
    id: "p_marketing",
    name: "Marketing Q3",
    description:
      "Activation-driven lifecycle rework: onboarding emails, pricing experiment retro, and customer research.",
    memberIds: ["u_meera", "u_arjun", "u_riya", "u_sneha", "u_ananya"],
    color: "bg-rose-800",
    createdAt: iso(-25),
  },
  {
    id: "p_security",
    name: "Security & Infra",
    description:
      "Patch the open CVE, harden the CI test infrastructure, and audit IAM access for the platform team.",
    memberIds: ["u_karan", "u_meera", "u_vikram", "u_dev", "u_ananya"],
    color: "bg-emerald-800",
    createdAt: iso(-20),
  },
  {
    id: "p_planning",
    name: "Annual Planning H2",
    description:
      "Cross-team planning — draft OKRs, run the August retro, and prep the board update for Q3.",
    memberIds: ["u_arjun", "u_meera", "u_karan", "u_vikram", "u_sneha", "u_ananya"],
    color: "bg-amber-800",
    createdAt: iso(-15),
  },
];

// --- Tasks (grouped by project) -------------------------------------------
const tasks = [
  // ═══════════════════════════════════════════════════════════════════
  // === Checkout v2 API — Arjun, Karan, Riya, Vikram, Dev ==========
  // ═══════════════════════════════════════════════════════════════════

  // TODAY
  {
    id: "t_co_today_1",
    projectId: "p_checkout",
    title: "Code-review the idempotency middleware PR",
    description:
      "Walk through Arjun's PR #482, focus on the retry-after-failure path and the lock contention assumptions.",
    assigneeId: "u_karan",
    priority: "high" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_co_today_2",
    projectId: "p_checkout",
    title: "Finalize OpenAPI error response schemas",
    description:
      "Lock down the structured error envelopes (problem+json), then close out the spec PR.",
    assigneeId: "u_arjun",
    priority: "medium" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-3),
  },
  {
    id: "t_co_today_3",
    projectId: "p_checkout",
    title: "Write integration tests for payment retry flow",
    description:
      "Cover edge cases: card declined then approved, network timeout mid-charge, duplicate idempotency key within 10s window.",
    assigneeId: "u_riya",
    priority: "high" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-2),
  },
  {
    id: "t_co_today_4",
    projectId: "p_checkout",
    title: "Load-test /checkout v2 endpoints",
    description:
      "Run k6 load test at 500 RPS for 10 min, capture p99 latencies. Compare against v1 baseline.",
    assigneeId: "u_vikram",
    priority: "medium" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_co_today_5",
    projectId: "p_checkout",
    title: "Update Postman collection for v2 endpoints",
    description:
      "Sync the shared Postman workspace with the latest OpenAPI spec. Add example requests for each error code.",
    assigneeId: "u_dev",
    priority: "low" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-2),
  },

  // YESTERDAY → overdue
  {
    id: "t_co_yest_1",
    projectId: "p_checkout",
    title: "Security audit of checkout endpoints",
    description:
      "Threat-model the new endpoints — replay, IDOR, and rate-limit bypass. Document any findings.",
    assigneeId: "u_karan",
    priority: "high" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-4),
  },
  {
    id: "t_co_yest_2",
    projectId: "p_checkout",
    title: "Fix currency rounding bug in multi-currency checkout",
    description:
      "JPY and KRW amounts are getting decimal places. Enforce zero-decimal logic for those currencies.",
    assigneeId: "u_riya",
    priority: "high" as const,
    deadline: iso(-1),
    status: "in_progress" as const,
    createdAt: iso(-3),
  },
  {
    id: "t_co_yest_3",
    projectId: "p_checkout",
    title: "Document webhook payload schema for checkout events",
    description:
      "Write the webhook docs for checkout.started, checkout.completed, and checkout.failed events.",
    assigneeId: "u_dev",
    priority: "medium" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-4),
  },

  // OLDER
  {
    id: "t_co_overdue_1",
    projectId: "p_checkout",
    title: "Ship /checkout endpoints with idempotency",
    description:
      "Finalize the new /checkout endpoints with idempotency keys, retries, and structured error envelopes.",
    assigneeId: "u_arjun",
    priority: "high" as const,
    deadline: iso(-3),
    status: "in_progress" as const,
    createdAt: iso(-12),
  },
  {
    id: "t_co_week_1",
    projectId: "p_checkout",
    title: "Deprecate /pay v1 in client SDKs",
    description: "Mark v1 endpoints deprecated in JS/Python SDKs with a 6-month sunset notice.",
    assigneeId: "u_arjun",
    priority: "low" as const,
    deadline: iso(4),
    status: "todo" as const,
    createdAt: iso(-3),
  },
  {
    id: "t_co_done_1",
    projectId: "p_checkout",
    title: "Add idempotency contract tests",
    description:
      "Cover duplicate-request, retry-after-failure, and stale-key cases in the contract test suite.",
    assigneeId: "u_arjun",
    priority: "high" as const,
    deadline: iso(-8),
    status: "done" as const,
    createdAt: iso(-14),
  },

  // ═══════════════════════════════════════════════════════════════════
  // === Marketing Q3 — Meera, Arjun, Riya, Sneha, Ananya ===========
  // ═══════════════════════════════════════════════════════════════════

  // TODAY
  {
    id: "t_mk_today_1",
    projectId: "p_marketing",
    title: "Review activation funnel data for Q3 readout",
    description:
      "Pull the funnel numbers from Mixpanel for the past 30 days and flag any unusual drop-offs.",
    assigneeId: "u_arjun",
    priority: "medium" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-2),
  },
  {
    id: "t_mk_today_2",
    projectId: "p_marketing",
    title: "Finalize day-0 onboarding email copy",
    description:
      "Decide between the 'project-first' and 'invite-first' opening — ship whichever Anita signs off.",
    assigneeId: "u_meera",
    priority: "high" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-2),
  },
  {
    id: "t_mk_today_3",
    projectId: "p_marketing",
    title: "Design social media assets for product launch",
    description:
      "Create 5 carousel graphics for LinkedIn and 3 story templates for Instagram. Use the new brand kit.",
    assigneeId: "u_riya",
    priority: "medium" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-2),
  },
  {
    id: "t_mk_today_4",
    projectId: "p_marketing",
    title: "Draft press release for Q3 feature launch",
    description:
      "800-word press release covering the three headline features. Get quotes from product lead and CTO.",
    assigneeId: "u_sneha",
    priority: "high" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_mk_today_5",
    projectId: "p_marketing",
    title: "Set up UTM tracking for Q3 campaign links",
    description:
      "Create UTM-tagged links for email, social, blog, and paid channels. Log them in the campaign tracker sheet.",
    assigneeId: "u_ananya",
    priority: "medium" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-1),
  },

  // YESTERDAY → overdue
  {
    id: "t_mk_yest_1",
    projectId: "p_marketing",
    title: "Q3 email cadence proposal",
    description:
      "Draft the proposed send-frequency for the lifecycle series and circulate to growth.",
    assigneeId: "u_arjun",
    priority: "medium" as const,
    deadline: iso(-1),
    status: "in_progress" as const,
    createdAt: iso(-6),
  },
  {
    id: "t_mk_yest_2",
    projectId: "p_marketing",
    title: "Redesign day-0 onboarding email (v1)",
    description:
      "Rewrite the day-0 welcome email. Focus on the activation step (creating first project).",
    assigneeId: "u_meera",
    priority: "medium" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-9),
  },
  {
    id: "t_mk_yest_3",
    projectId: "p_marketing",
    title: "Competitor messaging audit — top 5 players",
    description:
      "Analyze landing pages, email sequences, and pricing pages of our top 5 competitors. Summarize positioning gaps.",
    assigneeId: "u_sneha",
    priority: "medium" as const,
    deadline: iso(-1),
    status: "in_progress" as const,
    createdAt: iso(-5),
  },
  {
    id: "t_mk_yest_4",
    projectId: "p_marketing",
    title: "Write blog post: '5 signs your team needs a task accountability tool'",
    description:
      "SEO-optimized blog post, 1200 words. Include internal links to the product page and case studies.",
    assigneeId: "u_ananya",
    priority: "low" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-4),
  },

  // OLDER
  {
    id: "t_mk_week_1",
    projectId: "p_marketing",
    title: "August pricing experiment retro",
    description:
      "Pull conversion deltas, ARR impact, and write a one-page retro for the leadership review.",
    assigneeId: "u_meera",
    priority: "medium" as const,
    deadline: iso(3),
    status: "todo" as const,
    createdAt: iso(-2),
  },
  {
    id: "t_mk_week_2",
    projectId: "p_marketing",
    title: "Customer interview synthesis (5 enterprise)",
    description:
      "Summarize the five enterprise customer interviews into a single themes doc with quotes.",
    assigneeId: "u_meera",
    priority: "low" as const,
    deadline: iso(6),
    status: "in_progress" as const,
    createdAt: iso(-7),
  },
  {
    id: "t_mk_done_1",
    projectId: "p_marketing",
    title: "August feature launch newsletter",
    description: "Draft, design review, and send the August feature launch newsletter.",
    assigneeId: "u_meera",
    priority: "low" as const,
    deadline: iso(-12),
    status: "done" as const,
    createdAt: iso(-18),
  },

  // ═══════════════════════════════════════════════════════════════════
  // === Security & Infra — Karan, Meera, Vikram, Dev, Ananya =======
  // ═══════════════════════════════════════════════════════════════════

  // TODAY
  {
    id: "t_sec_today_1",
    projectId: "p_security",
    title: "Review GDPR data-retention copy",
    description:
      "Read through the new retention notice; flag anything that contradicts the privacy policy.",
    assigneeId: "u_meera",
    priority: "medium" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-2),
  },
  {
    id: "t_sec_today_2",
    projectId: "p_security",
    title: "CVE-2025-9911 regression sweep",
    description:
      "Run the full thumbnail pipeline regression suite after the libimg bump and triage failures.",
    assigneeId: "u_karan",
    priority: "high" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-3),
  },
  {
    id: "t_sec_today_3",
    projectId: "p_security",
    title: "Rotate production database credentials",
    description:
      "Rotate all prod DB passwords and connection strings. Update vault secrets and verify app connectivity post-rotation.",
    assigneeId: "u_vikram",
    priority: "high" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_sec_today_4",
    projectId: "p_security",
    title: "Review PR for rate-limiter middleware",
    description:
      "Code review Dev's PR #519 — sliding-window rate limiter. Check Redis key expiry logic and header compliance.",
    assigneeId: "u_ananya",
    priority: "medium" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_sec_today_5",
    projectId: "p_security",
    title: "Implement sliding-window rate limiter",
    description:
      "Build the Redis-backed sliding-window rate limiter for all public API endpoints. Target: 100 req/min per API key.",
    assigneeId: "u_dev",
    priority: "high" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-3),
  },

  // YESTERDAY → overdue
  {
    id: "t_sec_yest_1",
    projectId: "p_security",
    title: "Draft user-facing security FAQ",
    description:
      "Short FAQ on 2FA, session lifetimes, and the new audit log. Aimed at non-technical readers.",
    assigneeId: "u_meera",
    priority: "low" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-5),
  },
  {
    id: "t_sec_yest_2",
    projectId: "p_security",
    title: "Fix Terraform drift in staging VPC config",
    description:
      "Staging VPC has manual changes that drifted from Terraform state. Reconcile and re-apply.",
    assigneeId: "u_vikram",
    priority: "high" as const,
    deadline: iso(-1),
    status: "in_progress" as const,
    createdAt: iso(-3),
  },
  {
    id: "t_sec_yest_3",
    projectId: "p_security",
    title: "Scan npm dependencies for known vulnerabilities",
    description:
      "Run npm audit on all services. Triage critical/high findings — patch or document accepted risk.",
    assigneeId: "u_dev",
    priority: "medium" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-4),
  },

  // OLDER
  {
    id: "t_sec_overdue_1",
    projectId: "p_security",
    title: "Patch CVE-2025-9911",
    description:
      "Bump the vulnerable image-parsing dependency and verify no regressions in the thumbnail pipeline.",
    assigneeId: "u_karan",
    priority: "high" as const,
    deadline: iso(-3),
    status: "in_progress" as const,
    createdAt: iso(-8),
  },
  {
    id: "t_sec_blocked_1",
    projectId: "p_security",
    title: "Investigate flaky billing tests",
    description:
      "Three tests in billing/__tests__/invoice.spec.ts fail ~10% of the time in CI. Find the race condition.",
    assigneeId: "u_karan",
    priority: "high" as const,
    deadline: iso(2),
    status: "blocked" as const,
    createdAt: iso(-6),
  },
  {
    id: "t_sec_week_1",
    projectId: "p_security",
    title: "Audit IAM roles for platform team",
    description:
      "Review every role, remove unused permissions, and tighten the principle of least privilege.",
    assigneeId: "u_karan",
    priority: "medium" as const,
    deadline: iso(8),
    status: "todo" as const,
    createdAt: iso(-2),
  },
  {
    id: "t_sec_done_1",
    projectId: "p_security",
    title: "Set up secrets rotation in vault",
    description:
      "Automate 30-day rotation for all production secrets and document the rollback procedure.",
    assigneeId: "u_karan",
    priority: "medium" as const,
    deadline: iso(-15),
    status: "done" as const,
    createdAt: iso(-22),
  },

  // ═══════════════════════════════════════════════════════════════════
  // === Annual Planning H2 — Arjun, Meera, Karan, Vikram, Sneha, Ananya
  // ═══════════════════════════════════════════════════════════════════

  // TODAY
  {
    id: "t_pl_today_1",
    projectId: "p_planning",
    title: "Today's planning sync — capture decisions",
    description:
      "Run the 11am planning sync; capture decisions, owners, and follow-ups in the planning doc.",
    assigneeId: "u_arjun",
    priority: "high" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_pl_today_2",
    projectId: "p_planning",
    title: "Pull headcount projections from finance",
    description:
      "Need the Q3 hiring plan from finance to slot into the OKR draft. Owner: Meera; Backup: Karan.",
    assigneeId: "u_meera",
    priority: "medium" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-2),
  },
  {
    id: "t_pl_today_3",
    projectId: "p_planning",
    title: "Compile engineering velocity metrics for H1",
    description:
      "Pull cycle time, deployment frequency, and change failure rate from the CI dashboard. Format for the board deck.",
    assigneeId: "u_vikram",
    priority: "medium" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_pl_today_4",
    projectId: "p_planning",
    title: "Schedule 1:1 feedback sessions with all team leads",
    description:
      "Block 30-min slots with each of the 6 team leads before Friday. Share the pre-read agenda in advance.",
    assigneeId: "u_sneha",
    priority: "medium" as const,
    deadline: iso(0),
    status: "in_progress" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_pl_today_5",
    projectId: "p_planning",
    title: "Update the risk register with Q3 dependencies",
    description:
      "Add cross-team dependencies, vendor risks, and hiring gaps to the master risk register spreadsheet.",
    assigneeId: "u_ananya",
    priority: "high" as const,
    deadline: iso(0),
    status: "todo" as const,
    createdAt: iso(-2),
  },

  // YESTERDAY → overdue
  {
    id: "t_pl_yest_1",
    projectId: "p_planning",
    title: "Draft engineering OKRs section",
    description:
      "Three OKRs covering reliability, platform velocity, and cost. Wire to the planning doc when done.",
    assigneeId: "u_karan",
    priority: "high" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-4),
  },
  {
    id: "t_pl_yest_2",
    projectId: "p_planning",
    title: "Summarize customer churn data for leadership review",
    description:
      "Pull churn numbers by segment (SMB vs enterprise) for the past 2 quarters. One-page summary with chart.",
    assigneeId: "u_sneha",
    priority: "high" as const,
    deadline: iso(-1),
    status: "in_progress" as const,
    createdAt: iso(-3),
  },
  {
    id: "t_pl_yest_3",
    projectId: "p_planning",
    title: "Map team capacity vs planned initiatives for Q3",
    description:
      "Cross-reference the initiative list with available FTEs. Flag anything that's over-allocated by >20%.",
    assigneeId: "u_vikram",
    priority: "medium" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-3),
  },
  {
    id: "t_pl_yest_4",
    projectId: "p_planning",
    title: "Collect budget actuals from department heads",
    description:
      "Chase finance and ops for Q2 actuals. Need it before the board deck can be finalized.",
    assigneeId: "u_ananya",
    priority: "medium" as const,
    deadline: iso(-1),
    status: "todo" as const,
    createdAt: iso(-4),
  },

  // OLDER
  {
    id: "t_pl_week_1",
    projectId: "p_planning",
    title: "Draft Q3 team OKRs",
    description: "Roll up the per-team OKRs into the master Q3 sheet with measurable key results.",
    assigneeId: "u_arjun",
    priority: "medium" as const,
    deadline: iso(5),
    status: "todo" as const,
    createdAt: iso(-4),
  },
  {
    id: "t_pl_week_2",
    projectId: "p_planning",
    title: "Prep Q3 board update deck",
    description:
      "Five slides: revenue, product, ops, hiring, risks. Numbers must match finance's source of truth.",
    assigneeId: "u_arjun",
    priority: "high" as const,
    deadline: iso(7),
    status: "todo" as const,
    createdAt: iso(-1),
  },
  {
    id: "t_pl_done_1",
    projectId: "p_planning",
    title: "Compile August retro doc",
    description:
      "Pull notes from all three retro sessions and synthesize a single doc with action items.",
    assigneeId: "u_meera",
    priority: "low" as const,
    deadline: iso(-5),
    status: "done" as const,
    createdAt: iso(-10),
  },
];

// --- Work logs (incl. one obviously vague to make the AI verdict pop) ----
const logs = [
  {
    id: "l_co_1",
    taskId: "t_co_overdue_1",
    authorId: "u_arjun",
    text:
      "Wrote the idempotency-key middleware and added 12 contract tests covering retries and duplicate requests. OpenAPI spec is ~80% done — missing the error response schemas.",
    createdAt: iso(-1),
  },
  {
    id: "l_mk_1",
    taskId: "t_mk_yest_2",
    authorId: "u_meera",
    text: "did some stuff",
    createdAt: iso(-1),
  },
  {
    id: "l_sec_1",
    taskId: "t_sec_overdue_1",
    authorId: "u_karan",
    text:
      "Bumped libimg from 1.4.2 to 1.5.1, ran the full thumbnail regression suite — all green except one flaky test in animated-gif handling. Opened a separate ticket for that.",
    createdAt: iso(0),
  },
  {
    id: "l_co_2",
    taskId: "t_co_yest_2",
    authorId: "u_riya",
    text:
      "Identified the root cause — toFixed(2) was applied universally. Added a zero-decimal currency map and unit tests for JPY, KRW, and VND. PR #501 is up for review.",
    createdAt: iso(0),
  },
  {
    id: "l_sec_2",
    taskId: "t_sec_yest_2",
    authorId: "u_vikram",
    text:
      "Imported the manual SG rules back into Terraform state. Re-ran plan — zero drift now. Will apply to staging after Karan's review.",
    createdAt: iso(0),
  },
  {
    id: "l_mk_2",
    taskId: "t_mk_yest_3",
    authorId: "u_sneha",
    text: "looked at some competitor sites",
    createdAt: iso(0),
  },
  {
    id: "l_pl_1",
    taskId: "t_pl_yest_2",
    authorId: "u_sneha",
    text:
      "Pulled churn data from Stripe and Segment. SMB churn is 4.2% (up from 3.8%), enterprise is stable at 0.9%. Building the chart in Google Sheets now.",
    createdAt: iso(0),
  },
  {
    id: "l_sec_3",
    taskId: "t_sec_today_5",
    authorId: "u_dev",
    text:
      "Implemented the sliding window algorithm with Redis ZRANGEBYSCORE. Passes all unit tests. Need to add response headers (X-RateLimit-Remaining, Retry-After) before merging.",
    createdAt: iso(0),
  },
  {
    id: "l_mk_3",
    taskId: "t_mk_today_5",
    authorId: "u_ananya",
    text: "working on it",
    createdAt: iso(0),
  },
];

// --- Audit seed ------------------------------------------------------------
const audit = [
  {
    id: "a_1",
    actorId: "u_priya",
    action: 'assigned task "Ship /checkout endpoints with idempotency" to Arjun',
    taskId: "t_co_overdue_1",
    projectId: "p_checkout",
    at: iso(-12),
  },
  {
    id: "a_2",
    actorId: "u_arjun",
    action: 'changed status to in progress on "Ship /checkout endpoints with idempotency"',
    taskId: "t_co_overdue_1",
    projectId: "p_checkout",
    at: iso(-10),
  },
  {
    id: "a_3",
    actorId: "u_karan",
    action: 'changed status to done on "Set up secrets rotation in vault"',
    taskId: "t_sec_done_1",
    projectId: "p_security",
    at: iso(-15),
  },
  {
    id: "a_4",
    actorId: "u_riya",
    action: 'submitted work log on "Fix currency rounding bug in multi-currency checkout"',
    taskId: "t_co_yest_2",
    projectId: "p_checkout",
    at: iso(0),
  },
  {
    id: "a_5",
    actorId: "u_vikram",
    action: 'changed status to in progress on "Fix Terraform drift in staging VPC config"',
    taskId: "t_sec_yest_2",
    projectId: "p_security",
    at: iso(-2),
  },
  {
    id: "a_6",
    actorId: "u_dev",
    action: 'submitted work log on "Implement sliding-window rate limiter"',
    taskId: "t_sec_today_5",
    projectId: "p_security",
    at: iso(0),
  },
];

export const seedState: AppState = {
  currentUserId: null,
  users,
  projects,
  tasks,
  logs,
  audit,
  reminders: [],
};

// Single hardcoded password for the demo — every user uses this.
export const DEMO_PASSWORD = "hrudhay123";
