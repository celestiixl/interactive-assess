"use client";

import type { StudentProfile } from "@/types/challenge";
import { normalizeDisplayName, validateStudentName } from "@/lib/nameModeration";

export const PROFILE_KEY = "bio.challenge.profile.v1";
export const LAST_LOGIN_KEY = "bio.challenge.last-login.v1";

export const DEFAULT_PROFILE: StudentProfile = {
  name: "",
  nameLocked: false,
  classCode: "BIO-7A",
  xp: 0,
  level: 1,
  streak: 0,
  badges: [],
  topicAccuracy: {},
  preferredMode: "text",
};

function mergeProfile(input: Partial<StudentProfile> | null | undefined): StudentProfile {
  const merged: StudentProfile = {
    ...DEFAULT_PROFILE,
    ...(input ?? {}),
    badges: Array.isArray(input?.badges) ? input!.badges : [],
    topicAccuracy: input?.topicAccuracy ?? {},
    preferredMode:
      input?.preferredMode === "video" ||
      input?.preferredMode === "interactive" ||
      input?.preferredMode === "visual" ||
      input?.preferredMode === "text"
        ? input.preferredMode
        : "text",
  };

  const cleanName = normalizeDisplayName(merged.name);
  const shouldLockByLegacy = Boolean(cleanName) && cleanName.toLowerCase() !== "new explorer";
  const locked = typeof input?.nameLocked === "boolean" ? input.nameLocked : shouldLockByLegacy;

  return {
    ...merged,
    name: cleanName,
    nameLocked: locked,
  };
}

export function loadStudentProfile(): StudentProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<StudentProfile>;
    return mergeProfile(parsed);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function setStudentNameOnce(
  profile: StudentProfile,
  candidate: string,
): { ok: true; profile: StudentProfile } | { ok: false; reason: string } {
  if (profile.nameLocked) {
    return { ok: false, reason: "Name can only be set once at account creation." };
  }

  const validation = validateStudentName(candidate);
  if (!validation.valid) {
    return { ok: false, reason: validation.reason ?? "Invalid name." };
  }

  const next: StudentProfile = {
    ...profile,
    name: validation.normalizedName ?? normalizeDisplayName(candidate),
    nameLocked: true,
  };

  return { ok: true, profile: next };
}

export async function validateStudentNameServer(name: string): Promise<
  { ok: true; normalizedName: string } | { ok: false; reason: string }
> {
  try {
    const response = await fetch("/api/student/validate-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      reason?: string;
      normalizedName?: string;
    };

    if (!response.ok || !payload.ok) {
      return {
        ok: false,
        reason: payload.reason ?? "Name validation failed.",
      };
    }

    return {
      ok: true,
      normalizedName: payload.normalizedName ?? normalizeDisplayName(name),
    };
  } catch {
    return {
      ok: false,
      reason: "Could not validate name right now. Please try again.",
    };
  }
}

export async function setStudentNameOnceWithServer(
  profile: StudentProfile,
  candidate: string,
): Promise<{ ok: true; profile: StudentProfile } | { ok: false; reason: string }> {
  const serverCheck = await validateStudentNameServer(candidate);
  if (!serverCheck.ok) {
    return serverCheck;
  }

  return setStudentNameOnce(profile, serverCheck.normalizedName);
}
