import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StudentProfile {
  /** Prisma-generated DB id (cuid) */
  id: string;
  displayName: string;
  period: number;
}

interface StudentAuthState {
  student: StudentProfile | null;
  /** Called after a successful POST /api/student/login to persist the DB record. */
  setStudent: (student: StudentProfile) => void;
  logout: () => void;
}

export const useStudentAuth = create<StudentAuthState>()(
  persist(
    (set) => ({
      student: null,
      setStudent: (student) => set({ student }),
      logout: () => set({ student: null }),
    }),
    {
      name: "biospark:student:session",
    }
  )
);
