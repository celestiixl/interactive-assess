"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "@/components/ia/ThemeToggle";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import type { StudentProfile } from "@/types/challenge";
import { BADGE_MILESTONES, levelTitle } from "@/lib/challengeData";
import {
  DEFAULT_PROFILE,
  loadStudentProfile,
  saveStudentProfile,
  setStudentNameOnceWithServer,
} from "@/lib/studentProfile";

function masteryPercent(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    try {
      const parsed = loadStudentProfile();
      setProfile(parsed);
      setCandidateName(parsed.name);
      saveStudentProfile(parsed);
    } catch {
      setProfile(DEFAULT_PROFILE);
    }
    setReady(true);
  }, []);

  async function handleSetNameOnce() {
    if (isSavingName) return;

    setIsSavingName(true);
    setNameSaved(false);
    setNameError(null);

    try {
      const result = await setStudentNameOnceWithServer(profile, candidateName);
      if (!result.ok) {
        setNameError(result.reason);
        return;
      }

      setProfile(result.profile);
      saveStudentProfile(result.profile);
      setNameSaved(true);
    } catch {
      setNameError("Could not validate name right now. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  }

  const topicRows = useMemo(() => {
    return Object.entries(profile.topicAccuracy)
      .map(([topic, value]) => ({
        topic,
        percent: masteryPercent(value.correct, value.total),
        correct: value.correct,
        total: value.total,
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [profile.topicAccuracy]);

  const xpInLevel = profile.xp % 100;

  if (!ready) {
    return <main className="p-6 text-bs-text">Loading profile...</main>;
  }

  return (
    <main className="ia-vh-page relative h-dvh overflow-hidden px-3 py-3 text-bs-text sm:px-4 sm:py-4">
      <div className="ia-vh-grid grid h-full min-h-0 grid-rows-[auto_1fr] gap-3">
        <section className="ia-vh-tight rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-bs-text">My Profile</h1>
              <p className="mt-1 text-sm text-bs-text-sub">Track your BioSpark Quest progress, mastery, and unlocks.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/student/learn"
                className="rounded-xl border border-[var(--bs-border)] px-3 py-2 text-sm font-semibold text-bs-text-sub hover:bg-bs-raised"
              >
                BioSpark Quest
              </Link>
              <Link
                href="/student/dashboard"
                className="rounded-xl border border-[var(--bs-border)] px-3 py-2 text-sm font-semibold text-bs-text-sub hover:bg-bs-raised"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </section>

        <div className="ia-vh-scroll min-h-0 overflow-y-auto pr-1">
          <div className="ia-vh-grid grid gap-3 lg:grid-cols-[1.1fr_1fr]">
            <section className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">Student</div>
              <div className="mt-2 text-xl font-bold text-bs-text">{profile.name || "New Explorer"}</div>
              <div className="mt-1 text-sm text-bs-text-sub">Class Code: {profile.classCode}</div>

              <div className="mt-4 rounded-xl border border-[var(--bs-border)] bg-bs-surface p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">Account name</div>
                <p className="mt-1 text-xs text-bs-text-sub">
                  You can set your display name once during account creation.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => {
                      setCandidateName(e.target.value);
                      setNameError(null);
                      setNameSaved(false);
                    }}
                    disabled={profile.nameLocked}
                    placeholder="Enter your display name"
                    className="w-full max-w-sm rounded-lg border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm text-bs-text disabled:cursor-not-allowed disabled:bg-bs-raised"
                    maxLength={24}
                  />
                  <button
                    type="button"
                    onClick={handleSetNameOnce}
                    disabled={profile.nameLocked || isSavingName}
                    className="rounded-lg bg-bs-bg px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--bs-raised)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingName ? "Checking..." : "Set name permanently"}
                  </button>
                </div>
                {profile.nameLocked && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">Name is locked for this account.</p>
                )}
                {nameError && <p className="mt-2 text-xs font-semibold text-rose-700">{nameError}</p>}
                {nameSaved && !nameError && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">Name saved and locked.</p>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-[var(--bs-border)] bg-bs-surface p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-bs-text">
                  <span>XP Progress</span>
                  <span>{xpInLevel}/100</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-bs-raised">
                  <div className="ia-xp-fill h-full rounded-full bg-linear-to-r from-violet-500 to-emerald-400" style={{ width: `${xpInLevel}%` }} />
                </div>
                <div className="mt-2 text-xs text-bs-text-sub">
                  Level {profile.level} • {levelTitle(profile.level)} • Total XP: {profile.xp}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--bs-border)] p-3 text-center">
                  <div className="text-xs text-bs-text-sub">Streak</div>
                  <div className="text-lg font-bold text-amber-700">🔥 {profile.streak}</div>
                </div>
                <div className="rounded-xl border border-[var(--bs-border)] p-3 text-center">
                  <div className="text-xs text-bs-text-sub">Badges</div>
                  <div className="text-lg font-bold text-emerald-700">{profile.badges.length}</div>
                </div>
                <div className="rounded-xl border border-[var(--bs-border)] p-3 text-center">
                  <div className="text-xs text-bs-text-sub">Preferred Mode</div>
                  <div className="text-sm font-bold text-violet-700 capitalize">{profile.preferredMode}</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-bs-text-sub">Trophy Vault</h2>
              <div className="mt-2 grid gap-2">
                {BADGE_MILESTONES.map((badge) => {
                  const unlocked = profile.badges.includes(badge.key);
                  return (
                    <div
                      key={badge.key}
                      className={`rounded-lg border p-2.5 text-xs ${
                        unlocked
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub"
                      }`}
                    >
                      <div className="font-semibold">{unlocked ? "🏅" : "🔒"} {badge.label}</div>
                      <div className="mt-0.5">{badge.description}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="mt-3 rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-bs-text-sub">Topic Mastery</h2>
            {topicRows.length === 0 ? (
              <p className="mt-2 text-sm text-bs-text-sub">No mastery data yet. Complete a mission in BioSpark Quest to populate this section.</p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {topicRows.map((row) => (
                  <div key={row.topic} className="rounded-xl border border-[var(--bs-border)] p-3">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-bs-text-sub">
                      <span>{row.topic}</span>
                      <span>{row.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-bs-raised">
                      <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${row.percent}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] text-bs-text-sub">
                      {row.correct} correct / {row.total} attempts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
