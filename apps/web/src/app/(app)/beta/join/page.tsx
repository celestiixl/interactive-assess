"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateBetaCode } from "@/lib/betaGate";

const BETA_ACCESS_KEY = "biospark:beta:access";

export default function BetaJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const valid = validateBetaCode(code);
    setLoading(false);

    if (valid) {
      try {
        localStorage.setItem(
          BETA_ACCESS_KEY,
          JSON.stringify({ betaAccess: true, code: code.trim().toUpperCase() }),
        );
      } catch {
        // localStorage unavailable — proceed anyway
      }
      router.push("/teacher/login");
    } else {
      setError("That code isn't valid or has been deactivated");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bs-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-bs-border bg-bs-surface p-8 shadow-[var(--bs-shadow-md)]">
        {/* Welcome copy */}
        <div className="mb-6">
          <div className="mb-3 inline-block rounded-full border border-bs-teal/30 bg-bs-teal/10 px-2.5 py-[3px] text-[11px] font-semibold text-bs-teal">
            FBISD Beta
          </div>
          <h1 className="mb-2 font-[var(--bs-font-ui)] text-xl font-bold text-bs-text">
            Welcome to BioSpark
          </h1>
          <p className="text-sm text-bs-text-sub">
            BioSpark is currently available to selected FBISD classrooms.
            Enter the beta access code your teacher provided to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="beta-code"
            className="mb-1.5 block text-sm font-medium text-bs-text-sub"
          >
            Beta access code
          </label>
          <input
            id="beta-code"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
            required
            aria-required="true"
            aria-describedby={error ? "beta-error" : undefined}
            placeholder="FBISD-XXXX-2026"
            className="mb-4 w-full rounded-xl border border-bs-border bg-bs-bg px-4 py-2.5 font-mono text-sm text-bs-text placeholder-bs-text-muted outline-none focus:border-bs-teal focus:ring-1 focus:ring-bs-teal disabled:opacity-50"
          />

          {error && (
            <p
              id="beta-error"
              role="alert"
              className="mb-4 rounded-lg border border-bs-coral/30 bg-bs-coral/10 px-3 py-2 text-sm text-bs-coral"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full rounded-full bg-bs-teal py-2.5 text-sm font-bold text-[#04231f] transition-all hover:-translate-y-px hover:shadow-[var(--bs-teal-glow)] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? "Checking…" : "Join beta"}
          </button>
        </form>
      </div>
    </div>
  );
}
