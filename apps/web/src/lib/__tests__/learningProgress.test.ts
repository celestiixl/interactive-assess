// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import {
  loadLearningProgress,
  getLessonProgress,
  updateLessonProgress,
  addLessonTime,
  getMostRecentLessonId,
} from "@/lib/learningProgress";

beforeEach(() => {
  localStorage.clear();
});

describe("loadLearningProgress", () => {
  it("returns an empty map when nothing is stored", () => {
    expect(loadLearningProgress()).toEqual({});
  });
});

describe("getLessonProgress", () => {
  it("returns undefined for an unknown lesson", () => {
    expect(getLessonProgress("unknown-lesson")).toBeUndefined();
  });

  it("returns the stored progress for a known lesson", () => {
    updateLessonProgress("lesson-1", { percent: 50, completed: false });
    const progress = getLessonProgress("lesson-1");
    expect(progress).toBeDefined();
    expect(progress?.percent).toBe(50);
  });
});

describe("updateLessonProgress", () => {
  it("creates a new entry if none exists", () => {
    updateLessonProgress("lesson-new", { percent: 10 });
    const progress = getLessonProgress("lesson-new");
    expect(progress).toBeDefined();
    expect(progress?.percent).toBe(10);
    expect(progress?.completed).toBe(false);
  });

  it("merges the patch into an existing entry", () => {
    updateLessonProgress("lesson-1", { percent: 20 });
    updateLessonProgress("lesson-1", { percent: 60, checkScore: 80 });
    const progress = getLessonProgress("lesson-1");
    expect(progress?.percent).toBe(60);
    expect(progress?.checkScore).toBe(80);
    expect(progress?.completed).toBe(false);
  });

  it("marks completed when patch sets completed to true", () => {
    updateLessonProgress("lesson-1", { completed: true, percent: 100 });
    expect(getLessonProgress("lesson-1")?.completed).toBe(true);
  });

  it("updates lastVisitedAt on every call", () => {
    const before = new Date().toISOString();
    updateLessonProgress("lesson-1", { percent: 10 });
    const progress = getLessonProgress("lesson-1");
    expect(progress!.lastVisitedAt >= before).toBe(true);
  });

  it("returns the full updated progress map", () => {
    const map = updateLessonProgress("lesson-a", { percent: 30 });
    expect(map["lesson-a"]).toBeDefined();
  });
});

describe("addLessonTime", () => {
  it("adds seconds to a lesson that has no prior time", () => {
    addLessonTime("lesson-1", 120);
    expect(getLessonProgress("lesson-1")?.timeSpentSec).toBe(120);
  });

  it("accumulates time on subsequent calls", () => {
    addLessonTime("lesson-1", 60);
    addLessonTime("lesson-1", 45);
    expect(getLessonProgress("lesson-1")?.timeSpentSec).toBe(105);
  });

  it("clamps to 0 when negative seconds would make the total negative", () => {
    addLessonTime("lesson-1", -500);
    expect(getLessonProgress("lesson-1")?.timeSpentSec).toBe(0);
  });

  it("returns the updated progress map", () => {
    const map = addLessonTime("lesson-1", 30);
    expect(map["lesson-1"]).toBeDefined();
  });
});

describe("getMostRecentLessonId", () => {
  it("returns null for an empty map", () => {
    expect(getMostRecentLessonId({})).toBeNull();
  });

  it("returns the single lesson ID when only one lesson exists", () => {
    updateLessonProgress("lesson-only", { percent: 50 });
    const map = loadLearningProgress();
    expect(getMostRecentLessonId(map)).toBe("lesson-only");
  });

  it("returns the most recently visited lesson", () => {
    // Seed two lessons with different timestamps
    const map = {
      "lesson-old": {
        completed: false,
        percent: 20,
        lastVisitedAt: "2024-01-01T00:00:00.000Z",
      },
      "lesson-new": {
        completed: false,
        percent: 50,
        lastVisitedAt: "2025-06-01T00:00:00.000Z",
      },
    };
    expect(getMostRecentLessonId(map)).toBe("lesson-new");
  });
});
