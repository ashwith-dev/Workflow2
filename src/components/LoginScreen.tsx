"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export default function LoginScreen() {
  const { state, login } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const r = login(email, password);
    if (!r.ok) {
      setError(r.error ?? "Login failed.");
      setSubmitting(false);
    }
  }

  function fillFor(userEmail: string) {
    setEmail(userEmail);
    setPassword("hrudhay123");
    setError(null);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        {/* Login card */}
        <div className="wf-card overflow-hidden">
          <div className="bg-slate-900 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-lg font-extrabold">
                W
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">WorkFlow</h1>
                <p className="text-xs text-white/80">
                  Sign in with your @workflow.in email.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 p-6">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Work email
              </span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun@workflow.in"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="wf-card overflow-hidden">
          <div className="bg-slate-700 px-6 py-5 text-white">
            <h2 className="text-lg font-bold">Demo credentials</h2>
            <p className="text-xs text-white/80">
              Click any user to autofill. Password for everyone is{" "}
              <code className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[11px]">
                hrudhay123
              </code>
              .
            </p>
          </div>

          <ul className="divide-y divide-slate-100 p-2">
            {state.users.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => fillFor(u.email)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-sm font-bold text-white shadow-sm">
                    {u.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {u.name}{" "}
                      <span
                        className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${
                          u.role === "manager" ? "bg-slate-900" : "bg-emerald-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {u.email}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Use →
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-slate-100 px-6 py-3 text-[11px] text-slate-500">
            Authentication is mocked locally — passwords are not sent over the
            network. Data persists in your browser.
          </div>
        </div>
      </div>
    </div>
  );
}
