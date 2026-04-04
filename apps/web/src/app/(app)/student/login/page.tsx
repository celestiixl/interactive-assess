"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudentAuth } from "@/lib/studentAuth";

export default function StudentLoginPage() {
  const router = useRouter();
  const login = useStudentAuth((s) => s.login);
  const register = useStudentAuth((s) => s.register);

  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Try logging in first. The existing studentAuth prototype stores the schoolId
    // as the password when registering via name+ID (prototype-only behaviour —
    // a production build must use a proper auth provider).
    const loginResult = login(schoolId, schoolId);
    if (loginResult.ok) {
      router.push("/student/dashboard");
      return;
    }

    // No existing account — register with schoolId as password
    const registerResult = register(schoolId, name, schoolId);
    if (registerResult.ok) {
      router.push("/student/dashboard");
      return;
    }

    setError(registerResult.error ?? "Something went wrong. Please try again.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bs-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-bs-border bg-bs-surface p-8 shadow-[var(--bs-shadow-md)]">
        <h1 className="mb-1 font-[var(--bs-font-ui)] text-2xl font-bold text-bs-text">
          Welcome to BioSpark 🌱
        </h1>
        <p className="mb-6 text-sm text-bs-text-sub">
          Enter your name and school ID to get started.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name field */}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            aria-required="true"
            aria-describedby={error ? "student-error" : undefined}
            placeholder="First Last"
            className="mb-4 w-full rounded-xl border border-bs-border bg-bs-bg px-4 py-2.5 text-sm text-bs-text placeholder-bs-text-muted outline-none focus:border-bs-teal focus:ring-1 focus:ring-bs-teal disabled:opacity-50"
          />

          {/* School ID field */}
          <label
            htmlFor="school-id"
            className="mb-1.5 block text-sm font-medium text-bs-text-sub"
          >
            School ID
          </label>
          <input
            id="school-id"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            disabled={loading}
            required
            aria-required="true"
            aria-describedby={error ? "student-error" : undefined}
            placeholder="123456"
            className="mb-4 w-full rounded-xl border border-bs-border bg-bs-bg px-4 py-2.5 text-sm text-bs-text placeholder-bs-text-muted outline-none focus:border-bs-teal focus:ring-1 focus:ring-bs-teal disabled:opacity-50"
          />

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
            disabled={loading || !name.trim() || !schoolId.trim()}
            className="w-full rounded-full bg-bs-teal py-2.5 text-sm font-bold text-[#04231f] transition-all hover:-translate-y-px hover:shadow-[var(--bs-teal-glow)] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Loading…" : "Let's go!"}
          </button>
        </form>
      </div>
    </div>
  );
}

