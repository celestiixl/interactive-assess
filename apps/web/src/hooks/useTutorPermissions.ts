"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorPermissions } from "@/types/tutor";

const STORAGE_KEY = "biospark:tutor:permissions";

const DEFAULT_PERMISSIONS: TutorPermissions = {
  enabledByTeacher: true,
  hiddenByStudent: false,
};

function readPermissions(): TutorPermissions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERMISSIONS;
    return { ...DEFAULT_PERMISSIONS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PERMISSIONS;
  }
}

function writePermissions(perms: TutorPermissions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
  } catch {
    // ignore write errors in restricted environments
  }
}

export function useTutorPermissions() {
  const [permissions, setPermissions] =
    useState<TutorPermissions>(DEFAULT_PERMISSIONS);

  useEffect(() => {
    setPermissions(readPermissions());
  }, []);

  const tutorEnabled =
    permissions.enabledByTeacher && !permissions.hiddenByStudent;

  const hideForStudent = useCallback(() => {
    setPermissions((prev) => {
      const next = { ...prev, hiddenByStudent: true };
      writePermissions(next);
      return next;
    });
  }, []);

  const showForStudent = useCallback(() => {
    setPermissions((prev) => {
      const next = { ...prev, hiddenByStudent: false };
      writePermissions(next);
      return next;
    });
  }, []);

  const setTeacherEnabled = useCallback(
    (enabled: boolean) => {
      setPermissions((prev) => {
        const next = { ...prev, enabledByTeacher: enabled };
        writePermissions(next);
        return next;
      });
    },
    [],
  );

  return {
    tutorEnabled,
    permissions,
    hideForStudent,
    showForStudent,
    setTeacherEnabled,
  };
}
