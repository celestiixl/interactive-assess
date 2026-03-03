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
    return <main className="p-6 text-slate-900">Loading profile...</main>;
  }

  return (
    <main className="ia-vh-page relative h-dvh overflow-hidden px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <div className="ia-vh-grid grid h-full min-h-0 grid-rows-[auto_1fr] gap-3">
        <section className="ia-vh-tight rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
              <p className="mt-1 text-sm text-slate-600">Track your BioSpark Quest progress, mastery, and unlocks.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/student/learn"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                BioSpark Quest
              </Link>
              <Link
                href="/student/dashboard"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </section>

        <div className="ia-vh-scroll min-h-0 overflow-y-auto pr-1">
          <div className="ia-vh-grid grid gap-3 lg:grid-cols-[1.1fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Student</div>
              <div className="mt-2 text-xl font-bold text-slate-900">{profile.name || "New Explorer"}</div>
              <div className="mt-1 text-sm text-slate-600">Class Code: {profile.classCode}</div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Account name</div>
                <p className="mt-1 text-xs text-slate-600">
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
                    className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
                    maxLength={24}
                  />
                  <button
                    type="button"
                    onClick={handleSetNameOnce}
                    disabled={profile.nameLocked || isSavingName}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>XP Progress</span>
                  <span>{xpInLevel}/100</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="ia-xp-fill h-full rounded-full bg-linear-to-r from-violet-500 to-emerald-400" style={{ width: `${xpInLevel}%` }} />
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Level {profile.level} • {levelTitle(profile.level)} • Total XP: {profile.xp}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3 text-center">
                  <div className="text-xs text-slate-600">Streak</div>
                  <div className="text-lg font-bold text-amber-700">🔥 {profile.streak}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-center">
                  <div className="text-xs text-slate-600">Badges</div>
                  <div className="text-lg font-bold text-emerald-700">{profile.badges.length}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-center">
                  <div className="text-xs text-slate-600">Preferred Mode</div>
                  <div className="text-sm font-bold text-violet-700 capitalize">{profile.preferredMode}</div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Trophy Vault</h2>
              <div className="mt-2 grid gap-2">
                {BADGE_MILESTONES.map((badge) => {
                  const unlocked = profile.badges.includes(badge.key);
                  return (
                    <div
                      key={badge.key}
                      className={`rounded-lg border p-2.5 text-xs ${
                        unlocked
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-slate-50 text-slate-600"
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

          <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Topic Mastery</h2>
            {topicRows.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No mastery data yet. Complete a mission in BioSpark Quest to populate this section.</p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {topicRows.map((row) => (
                  <div key={row.topic} className="rounded-xl border border-slate-200 p-3">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{row.topic}</span>
                      <span>{row.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${row.percent}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
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
