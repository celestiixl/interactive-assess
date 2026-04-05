"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudentAuth } from "@/lib/studentAuth";

export default function StudentLoginPage() {
  const router = useRouter();
  const setStudent = useStudentAuth((s) => s.setStudent);

  const [displayName, setDisplayName] = useState("");
  const [period, setPeriod] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), period }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Something went wrong. Please try again.");
        return;
      }

      const student = await res.json() as { id: string; displayName: string; period: number };
      setStudent({ id: student.id, displayName: student.displayName, period: student.period });
      router.push("/student/dashboard");
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bs-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-bs-border bg-bs-surface p-8 shadow-[var(--bs-shadow-md)]">
        <h1 className="mb-1 font-[var(--bs-font-ui)] text-2xl font-bold text-bs-text">
          Welcome to BioSpark 🌱
        </h1>
        <p className="mb-6 text-sm text-bs-text-sub">
          Enter your name and class period to get started.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Display name field */}
          <label
            htmlFor="student-name"
            className="mb-1.5 block text-sm font-medium text-bs-text-sub"
          >
            Your name
          </label>
          <input
            id="student-name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            required
            aria-required="true"
            aria-describedby={error ? "student-error" : undefined}
            placeholder="First Last"
            className="mb-4 w-full rounded-xl border border-bs-border bg-bs-bg px-4 py-2.5 text-sm text-bs-text placeholder-bs-text-muted outline-none focus:border-bs-teal focus:ring-1 focus:ring-bs-teal disabled:opacity-50"
          />

          {/* Period dropdown */}
          <label
            htmlFor="student-period"
            className="mb-1.5 block text-sm font-medium text-bs-text-sub"
          >
            Class period
          </label>
          <select
            id="student-period"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            disabled={loading}
            required
            aria-required="true"
            aria-describedby={error ? "student-error" : undefined}
            className="mb-4 w-full rounded-xl border border-bs-border bg-bs-bg px-4 py-2.5 text-sm text-bs-text outline-none focus:border-bs-teal focus:ring-1 focus:ring-bs-teal disabled:opacity-50"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
              <option key={p} value={p}>
                Period {p}
              </option>
            ))}
          </select>

          {error && (
            <p
              id="student-error"
              role="alert"
              className="mb-4 rounded-lg border border-bs-coral/30 bg-bs-coral/10 px-3 py-2 text-sm text-bs-coral"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="w-full rounded-full bg-bs-teal py-2.5 text-sm font-bold text-[#04231f] transition-all hover:-translate-y-px hover:shadow-[var(--bs-teal-glow)] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Loading…" : "Let's go!"}
          </button>
        </form>
      </div>
    </div>
  );
}


