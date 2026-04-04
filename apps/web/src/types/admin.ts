export interface AdminSession {
  isAdmin: true;
  authenticatedAt: number; // Date.now() timestamp
}

export interface BetaCode {
  code: string; // e.g. "FBISD-WOLF-2026"
  createdAt: number;
  usedCount: number;
  active: boolean;
  label?: string; // optional human note, e.g. "Dulles High - Ms. Rivera"
}

export interface BetaCodeStore {
  codes: BetaCode[];
}
