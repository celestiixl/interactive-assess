import { describe, it, expect } from "vitest";
import type { StudentMasteryEntry } from "@/types/period-mastery";
import { computePeriodMastery } from "@/lib/computePeriodMastery";

function makeEntry(
  overrides: Partial<StudentMasteryEntry> = {},
): StudentMasteryEntry {
  return {
    studentId: "s1",
    periodId: "period-1",
    teks: "B.5A",
    score: 0.8,
    attemptCount: 1,
    lastUpdated: Date.now(),
    ...overrides,
  };
}

describe("computePeriodMastery", () => {
  it("returns empty teksAggregates for an empty entry list", () => {
    const snapshot = computePeriodMastery([], "period-1", "Period 1");
    expect(snapshot.teksAggregates).toHaveLength(0);
    expect(snapshot.studentCount).toBe(0);
    expect(snapshot.periodId).toBe("period-1");
    expect(snapshot.periodLabel).toBe("Period 1");
  });

  it("filters out entries from other periods", () => {
    const entries = [
      makeEntry({ periodId: "period-1", teks: "B.5A", score: 0.9 }),
      makeEntry({ periodId: "period-2", teks: "B.5A", score: 0.4 }),
    ];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    expect(snapshot.teksAggregates).toHaveLength(1);
    expect(snapshot.teksAggregates[0].averageScore).toBeCloseTo(0.9);
  });

  it("computes average score correctly across multiple students", () => {
    const entries = [
      makeEntry({ studentId: "s1", score: 0.8 }),
      makeEntry({ studentId: "s2", score: 0.6 }),
      makeEntry({ studentId: "s3", score: 1.0 }),
    ];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    const agg = snapshot.teksAggregates[0];
    expect(agg.averageScore).toBeCloseTo((0.8 + 0.6 + 1.0) / 3);
  });

  it("counts tier2 correctly (score < 0.7)", () => {
    const entries = [
      makeEntry({ studentId: "s1", score: 0.9 }),
      makeEntry({ studentId: "s2", score: 0.65 }),
      makeEntry({ studentId: "s3", score: 0.6 }),
    ];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    expect(snapshot.teksAggregates[0].tier2Count).toBe(2);
  });

  it("counts tier3 correctly (score < 0.5 OR attemptCount >= 2)", () => {
    const entries = [
      makeEntry({ studentId: "s1", score: 0.49, attemptCount: 1 }),
      makeEntry({ studentId: "s2", score: 0.8, attemptCount: 2 }),
      makeEntry({ studentId: "s3", score: 0.9, attemptCount: 1 }),
    ];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    expect(snapshot.teksAggregates[0].tier3Count).toBe(2);
  });

  it("returns up to 5 weakest student IDs sorted ascending by score", () => {
    const entries = Array.from({ length: 8 }, (_, i) =>
      makeEntry({ studentId: `s${i}`, score: (i + 1) * 0.1 }),
    );
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    const weakest = snapshot.teksAggregates[0].weakestStudentIds;
    expect(weakest).toHaveLength(5);
    // Should be s0, s1, s2, s3, s4 (lowest scores first)
    expect(weakest[0]).toBe("s0");
    expect(weakest[4]).toBe("s4");
  });

  it("handles multiple TEKS and sorts aggregates alphabetically", () => {
    const entries = [
      makeEntry({ teks: "B.7A" }),
      makeEntry({ teks: "B.5A" }),
      makeEntry({ teks: "B.11A" }),
    ];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    const teksCodes = snapshot.teksAggregates.map((a) => a.teks);
    expect(teksCodes).toEqual([...teksCodes].sort());
  });

  it("counts unique students correctly", () => {
    const entries = [
      makeEntry({ studentId: "s1", teks: "B.5A" }),
      makeEntry({ studentId: "s1", teks: "B.7A" }), // same student, different TEKS
      makeEntry({ studentId: "s2", teks: "B.5A" }),
    ];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    expect(snapshot.studentCount).toBe(2);
  });

  it("includes a computedAt timestamp", () => {
    const before = Date.now();
    const snapshot = computePeriodMastery([], "period-1", "Period 1");
    const after = Date.now();
    expect(snapshot.computedAt).toBeGreaterThanOrEqual(before);
    expect(snapshot.computedAt).toBeLessThanOrEqual(after);
  });

  it("boundary: score exactly 0.7 is NOT tier2 (not < 0.7)", () => {
    const entries = [makeEntry({ score: 0.7, attemptCount: 0 })];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    expect(snapshot.teksAggregates[0].tier2Count).toBe(0);
  });

  it("boundary: score exactly 0.5 is NOT tier3 (not < 0.5)", () => {
    const entries = [makeEntry({ score: 0.5, attemptCount: 0 })];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    expect(snapshot.teksAggregates[0].tier3Count).toBe(0);
  });

  it("counts tier1 correctly (score >= 0.85)", () => {
    const entries = [
      makeEntry({ studentId: "s1", score: 0.85 }),
      makeEntry({ studentId: "s2", score: 0.9 }),
      makeEntry({ studentId: "s3", score: 0.84 }),
      makeEntry({ studentId: "s4", score: 1.0 }),
    ];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    // s1 (0.85), s2 (0.9), s4 (1.0) qualify; s3 (0.84) does not
    expect(snapshot.teksAggregates[0].tier1Count).toBe(3);
  });

  it("boundary: score exactly 0.85 IS tier1 (>= 0.85)", () => {
    const entries = [makeEntry({ score: 0.85 })];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    expect(snapshot.teksAggregates[0].tier1Count).toBe(1);
  });

  it("boundary: score 0.8499 is NOT tier1 (< 0.85)", () => {
    const entries = [makeEntry({ score: 0.8499 })];
    const snapshot = computePeriodMastery(entries, "period-1", "Period 1");
    expect(snapshot.teksAggregates[0].tier1Count).toBe(0);
  });
});
