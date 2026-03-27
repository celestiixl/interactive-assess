import { describe, it, expect } from "vitest";
import {
  normalizeCanonicalTeks,
  isPriorityTeks,
  interventionTierFromCheck,
  interventionStrategyForTier,
} from "@/lib/curriculumPolicy";

describe("normalizeCanonicalTeks", () => {
  it("returns empty string for empty input", () => {
    expect(normalizeCanonicalTeks("")).toBe("");
  });

  it("normalizes standard B.5A format", () => {
    expect(normalizeCanonicalTeks("B.5A")).toBe("B.5A");
  });

  it("uppercases lowercase input", () => {
    expect(normalizeCanonicalTeks("b.5a")).toBe("B.5A");
  });

  it("strips surrounding whitespace", () => {
    expect(normalizeCanonicalTeks("  B.5A  ")).toBe("B.5A");
  });

  it("strips internal whitespace", () => {
    expect(normalizeCanonicalTeks("B . 5 A")).toBe("B.5A");
  });

  it("converts legacy BIO.5.A format", () => {
    expect(normalizeCanonicalTeks("BIO.5.A")).toBe("B.5A");
  });

  it("converts legacy BIO5A format", () => {
    expect(normalizeCanonicalTeks("BIO5A")).toBe("B.5A");
  });

  it("normalizes B.11A", () => {
    expect(normalizeCanonicalTeks("B.11A")).toBe("B.11A");
  });

  it("normalizes B.7B", () => {
    expect(normalizeCanonicalTeks("b.7b")).toBe("B.7B");
  });

  it("handles input without dot separator", () => {
    expect(normalizeCanonicalTeks("B5A")).toBe("B.5A");
  });
});

describe("isPriorityTeks", () => {
  it("returns true for B.5A (priority)", () => {
    expect(isPriorityTeks("B.5A")).toBe(true);
  });

  it("returns true for B.5B (priority)", () => {
    expect(isPriorityTeks("B.5B")).toBe(true);
  });

  it("returns true for B.11A (priority)", () => {
    expect(isPriorityTeks("B.11A")).toBe(true);
  });

  it("returns true for B.11B (priority)", () => {
    expect(isPriorityTeks("B.11B")).toBe(true);
  });

  it("returns true for B.7A (priority)", () => {
    expect(isPriorityTeks("B.7A")).toBe(true);
  });

  it("returns true for B.7B (priority)", () => {
    expect(isPriorityTeks("B.7B")).toBe(true);
  });

  it("returns true for B.7C (priority)", () => {
    expect(isPriorityTeks("B.7C")).toBe(true);
  });

  it("returns true for B.1B (priority)", () => {
    expect(isPriorityTeks("B.1B")).toBe(true);
  });

  it("returns true for B.1D (priority)", () => {
    expect(isPriorityTeks("B.1D")).toBe(true);
  });

  it("returns true for B.3A (priority)", () => {
    expect(isPriorityTeks("B.3A")).toBe(true);
  });

  it("returns true for B.12B (priority)", () => {
    expect(isPriorityTeks("B.12B")).toBe(true);
  });

  it("returns false for non-priority B.5C", () => {
    expect(isPriorityTeks("B.5C")).toBe(false);
  });

  it("returns false for unknown TEKS", () => {
    expect(isPriorityTeks("B.99Z")).toBe(false);
  });

  it("accepts lowercase and normalizes before checking", () => {
    expect(isPriorityTeks("b.5a")).toBe(true);
  });

  it("accepts legacy BIO prefix", () => {
    expect(isPriorityTeks("BIO.5.A")).toBe(true);
  });
});

describe("interventionTierFromCheck", () => {
  it("returns null when score >= 70 and attempts < 2", () => {
    expect(interventionTierFromCheck(70, 0)).toBeNull();
    expect(interventionTierFromCheck(85, 1)).toBeNull();
    expect(interventionTierFromCheck(100, 0)).toBeNull();
  });

  it("returns 2 when score is between 50 and 69 (below 70)", () => {
    expect(interventionTierFromCheck(69, 0)).toBe(2);
    expect(interventionTierFromCheck(60, 0)).toBe(2);
    expect(interventionTierFromCheck(51, 0)).toBe(2);
  });

  it("returns 3 when score < 50", () => {
    expect(interventionTierFromCheck(49, 0)).toBe(3);
    expect(interventionTierFromCheck(0, 0)).toBe(3);
    expect(interventionTierFromCheck(20, 1)).toBe(3);
  });

  it("returns 3 when attempts >= 2 regardless of score", () => {
    expect(interventionTierFromCheck(90, 2)).toBe(3);
    expect(interventionTierFromCheck(75, 3)).toBe(3);
  });

  it("treats null score as 100 (no intervention)", () => {
    expect(interventionTierFromCheck(null, 0)).toBeNull();
  });

  it("treats undefined score as 100 (no intervention)", () => {
    expect(interventionTierFromCheck(undefined, 0)).toBeNull();
  });

  it("treats null attempts as 0", () => {
    expect(interventionTierFromCheck(60, null)).toBe(2);
  });

  it("treats undefined attempts as 0", () => {
    expect(interventionTierFromCheck(60, undefined)).toBe(2);
  });

  it("boundary: score exactly 50 is tier 2 (not < 50)", () => {
    expect(interventionTierFromCheck(50, 0)).toBe(2);
  });

  it("boundary: score exactly 70 returns null", () => {
    expect(interventionTierFromCheck(70, 0)).toBeNull();
  });
});

describe("interventionStrategyForTier", () => {
  it("returns Tier 3 message for tier 3", () => {
    const result = interventionStrategyForTier(3);
    expect(result).toContain("Tier 3");
    expect(result).toContain("tutoring");
  });

  it("returns Tier 2 message for tier 2", () => {
    const result = interventionStrategyForTier(2);
    expect(result).toContain("Tier 2");
    expect(result).toContain("graphic organizer");
  });

  it("returns no-intervention message for null", () => {
    const result = interventionStrategyForTier(null);
    expect(result).toContain("No intervention");
  });
});
