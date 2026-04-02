import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StudentProfile {
  schoolId: string;
  name: string;
  period?: string;
}

/**
 * Per-student credential record stored separately from the session.
 * NOTE: This is a client-side prototype store. Production deployments must use
 * a real auth provider and server-side password hashing.
 */
interface StudentCredential {
  schoolId: string;
  name: string;
  /** plaintext only in this local prototype */
  password: string;
  period?: string;
}

interface StudentAuthState {
  student: StudentProfile | null;
  /**
   * Register a new student account.
   * Returns an error string if the school ID is already taken.
   */
  register: (
    schoolId: string,
    name: string,
    password: string,
    period?: string
  ) => { ok: boolean; error?: string };
  /**
   * Log in with a school ID and password.
   */
  login: (
    schoolId: string,
    password: string
  ) => { ok: boolean; error?: string };
  logout: () => void;
}

const CREDENTIAL_STORE_KEY = "biospark:student:credentials";

function loadCredentials(): Record<string, StudentCredential> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CREDENTIAL_STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StudentCredential>) : {};
  } catch {
    return {};
  }
}

function saveCredentials(map: Record<string, StudentCredential>): void {
  try {
    localStorage.setItem(CREDENTIAL_STORE_KEY, JSON.stringify(map));
  } catch {
    // localStorage quota exceeded or unavailable - fail silently in prototype
  }
}

export const useStudentAuth = create<StudentAuthState>()(
  persist(
    (set) => ({
      student: null,

      register: (schoolId, name, password, period) => {
        const id = schoolId.trim().toUpperCase();
        if (!id || !name.trim() || !password) {
          return { ok: false, error: "All fields are required." };
        }
        if (password.length < 6) {
          return {
            ok: false,
            error: "Password must be at least 6 characters.",
          };
        }
        const credentials = loadCredentials();
        if (credentials[id]) {
          return {
            ok: false,
            error:
              "That school ID is already registered. Please log in instead.",
          };
        }
        const record: StudentCredential = {
          schoolId: id,
          name: name.trim(),
          password,
          period,
        };
        credentials[id] = record;
        saveCredentials(credentials);
        set({ student: { schoolId: id, name: record.name, period } });
        return { ok: true };
      },

      login: (schoolId, password) => {
        const id = schoolId.trim().toUpperCase();
        const credentials = loadCredentials();
        const record = credentials[id];
        if (!record || record.password !== password) {
          return {
            ok: false,
            error:
              "School ID or password is incorrect. Check with your teacher if you need help.",
          };
        }
        set({
          student: {
            schoolId: id,
            name: record.name,
            period: record.period,
          },
        });
        return { ok: true };
      },

      logout: () => set({ student: null }),
    }),
    {
      name: "biospark:student:session",
    }
  )
);
