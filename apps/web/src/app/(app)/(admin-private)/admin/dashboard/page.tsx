"use client";

import { useState, useEffect } from "react";
import type { BetaCode, BetaCodeStore } from "@/types/admin";

const BETA_CODES_KEY = "biospark:admin:betacodes";

const HEALTH_ITEMS = [
  {
    label: "Mastery persistence",
    status: "mock (localStorage)",
    tone: "amber",
  },
  {
    label: "Assignment store",
    status: "in-memory only",
    tone: "amber",
  },
  {
    label: "/api/teacher/period-mastery auth",
    status: "missing",
    tone: "red",
  },
  {
    label: "/student/* route guard",
    status: "missing",
    tone: "red",
  },
  {
    label: "Student password verification",
    status: "name-only",
    tone: "amber",
  },
] as const;

function toneClasses(tone: "amber" | "red") {
  return tone === "red"
    ? "border-bs-coral/30 bg-bs-coral/10 text-bs-coral"
    : "border-bs-amber/30 bg-bs-amber/10 text-bs-amber";
}

function loadCodes(): BetaCode[] {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(BETA_CODES_KEY)
        : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BetaCodeStore;
    return parsed.codes ?? [];
  } catch {
    return [];
  }
}

function saveCodes(codes: BetaCode[]) {
  try {
    const store: BetaCodeStore = { codes };
    window.localStorage.setItem(BETA_CODES_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded or unavailable
  }
}

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomValues = new Uint8Array(4);
  crypto.getRandomValues(randomValues);
  const suffix = Array.from(randomValues)
    .map((v) => chars[v % chars.length])
    .join("");
  return `FBISD-${suffix}-${new Date().getFullYear()}`;
}

export default function AdminDashboardPage() {
  const [codes, setCodes] = useState<BetaCode[]>([]);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    setCodes(loadCodes());
  }, []);

  function handleGenerate() {
    const newCode: BetaCode = {
      code: generateCode(),
      createdAt: Date.now(),
      usedCount: 0,
      active: true,
      label: newLabel.trim() || undefined,
    };
    const updated = [...codes, newCode];
    setCodes(updated);
    saveCodes(updated);
    setNewLabel("");
  }

  function handleRevoke(code: string) {
    const updated = codes.map((c) =>
      c.code === code ? { ...c, active: false } : c,
    );
    setCodes(updated);
    saveCodes(updated);
  }

  return (
    <div className="min-h-screen bg-bs-bg px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <span className="mb-2 inline-block rounded-full border border-bs-amber/30 bg-bs-amber/10 px-2.5 py-[3px] font-mono text-[11px] font-bold tracking-[0.06em] text-bs-amber">
            ADMIN
          </span>
          <h1 className="text-2xl font-bold text-bs-text">BioSpark Admin</h1>
          <p className="text-sm text-bs-text-sub">System health &amp; beta access management</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Panel A — System health */}
          <section
            aria-labelledby="health-heading"
            className="rounded-2xl border border-bs-border bg-bs-surface p-6"
          >
            <h2
              id="health-heading"
              className="mb-4 text-base font-semibold text-bs-text"
            >
              System Health
            </h2>
            <ul className="flex flex-col gap-3">
              {HEALTH_ITEMS.map(({ label, status, tone }) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-bs-text-sub">{label}</span>
                  <span
                    className={`rounded-full border px-2.5 py-[3px] text-[11px] font-semibold ${toneClasses(tone)}`}
                  >
                    {status}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Panel B — Beta codes */}
          <section
            aria-labelledby="beta-heading"
            className="rounded-2xl border border-bs-border bg-bs-surface p-6"
          >
            <h2
              id="beta-heading"
              className="mb-4 text-base font-semibold text-bs-text"
            >
              Beta Codes
            </h2>

            {/* Generate row */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder='Label (e.g. "Dulles - Ms. Rivera")'
                aria-label="Optional label for new beta code"
                className="min-w-0 flex-1 rounded-xl border border-bs-border bg-bs-bg px-3 py-2 text-sm text-bs-text placeholder-bs-text-muted outline-none focus:border-bs-teal focus:ring-1 focus:ring-bs-teal"
              />
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-full bg-bs-teal px-4 py-2 text-sm font-bold text-[#04231f] transition-all hover:-translate-y-px hover:shadow-[var(--bs-teal-glow)]"
              >
                Generate
              </button>
            </div>

            {codes.length === 0 ? (
              <p className="text-sm text-bs-text-muted">No codes yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-bs-border text-left text-xs text-bs-text-muted">
                      <th className="pb-2 pr-3 font-medium">Code</th>
                      <th className="pb-2 pr-3 font-medium">Label</th>
                      <th className="pb-2 pr-3 font-medium">Used</th>
                      <th className="pb-2 pr-3 font-medium">Active</th>
                      <th className="pb-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((c) => (
                      <tr
                        key={c.code}
                        className="border-b border-bs-border/50 last:border-0"
                      >
                        <td className="py-2 pr-3 font-mono text-xs text-bs-text">
                          {c.code}
                        </td>
                        <td className="py-2 pr-3 text-bs-text-sub">
                          {c.label ?? "—"}
                        </td>
                        <td className="py-2 pr-3 text-bs-text-sub">
                          {c.usedCount}
                        </td>
                        <td className="py-2 pr-3">
                          {c.active ? (
                            <span className="rounded-full border border-bs-success/30 bg-bs-success/10 px-2 py-[2px] text-[11px] font-semibold text-bs-success">
                              active
                            </span>
                          ) : (
                            <span className="rounded-full border border-bs-coral/30 bg-bs-coral/10 px-2 py-[2px] text-[11px] font-semibold text-bs-coral">
                              revoked
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {c.active && (
                            <button
                              type="button"
                              onClick={() => handleRevoke(c.code)}
                              className="rounded-full border border-bs-coral/40 px-3 py-1 text-xs font-semibold text-bs-coral transition-all hover:bg-bs-coral/10"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
