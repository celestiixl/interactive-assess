import type { BetaCodeStore } from "@/types/admin";

const BETA_CODES_KEY = "biospark:admin:betacodes";

/**
 * Validates a beta code entered by a prospective user.
 * - Case-insensitive match
 * - Must be active
 * - Increments usedCount on match and saves back to localStorage
 * - Wraps all localStorage access in try-catch
 */
export function validateBetaCode(input: string): boolean {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(BETA_CODES_KEY)
        : null;
    if (!raw) return false;

    const store = JSON.parse(raw) as BetaCodeStore;
    const needle = input.trim().toUpperCase();

    const idx = store.codes.findIndex(
      (c) => c.code.toUpperCase() === needle && c.active,
    );
    if (idx === -1) return false;

    // Increment usedCount and persist
    store.codes[idx] = {
      ...store.codes[idx],
      usedCount: store.codes[idx].usedCount + 1,
    };

    try {
      window.localStorage.setItem(BETA_CODES_KEY, JSON.stringify(store));
    } catch {
      // quota exceeded — validation still succeeds
    }

    return true;
  } catch {
    return false;
  }
}
