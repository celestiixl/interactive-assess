import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminSession } from "@/types/admin";

interface AdminAuthState {
  admin: AdminSession | null;
  setAdmin: (session: AdminSession | null) => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      setAdmin: (session) => set({ admin: session }),
    }),
    {
      name: "biospark:admin:session",
      // Tolerate corrupted localStorage — return null on parse failure
      storage: {
        getItem: (name) => {
          try {
            const raw =
              typeof window !== "undefined"
                ? window.localStorage.getItem(name)
                : null;
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(name, JSON.stringify(value));
            }
          } catch {
            // localStorage quota exceeded or unavailable — fail silently
          }
        },
        removeItem: (name) => {
          try {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(name);
            }
          } catch {
            // fail silently
          }
        },
      },
    },
  ),
);
