import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Teacher {
  name: string;
  email: string;
  school: string;
}

interface TeacherAuthState {
  teacher: Teacher | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

/** Demo accounts for the prototype. Replace with a real backend/auth provider in production. */
const DEMO_ACCOUNTS: Record<string, { password: string; teacher: Teacher }> = {
  // NOTE: These are plaintext demo-only credentials for local prototype use.
  // A production deployment must use a real auth provider and remove these.
  "teacher@biospark.app": {
    password: "biospark",
    teacher: {
      name: "Ms. Rivera",
      email: "teacher@biospark.app",
      school: "Austin High School",
    },
  },
  "demo@biospark.app": {
    password: "demo",
    teacher: {
      name: "Mr. Patel",
      email: "demo@biospark.app",
      school: "BioSpark Demo School",
    },
  },
};

export const useTeacherAuth = create<TeacherAuthState>()(
  persist(
    (set) => ({
      teacher: null,

      login: (email, password) => {
        const account = DEMO_ACCOUNTS[email.toLowerCase().trim()];
        if (!account || account.password !== password) {
          return { ok: false, error: "Invalid email or password. Try teacher@biospark.app / biospark" };
        }
        set({ teacher: account.teacher });
        return { ok: true };
      },

      logout: () => set({ teacher: null }),
    }),
    { name: "ia-teacher-auth" }
  )
);
