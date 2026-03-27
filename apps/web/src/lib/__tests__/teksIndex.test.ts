import { describe, it, expect } from "vitest";
import { getTeksEntry, teksLabel, normalizeTeksId } from "@/lib/teks/index";

describe("normalizeTeksId", () => {
  it("passes through a canonical ID unchanged", () => {
    expect(normalizeTeksId("B.5A")).toBe("B.5A");
  });

  it("uppercases lowercase input", () => {
    expect(normalizeTeksId("b.5a")).toBe("B.5A");
  });

  it("converts BIO.5.A legacy format", () => {
    expect(normalizeTeksId("BIO.5.A")).toBe("B.5A");
  });
});

describe("getTeksEntry", () => {
  it("returns an entry for a known TEKS code", () => {
    const entry = getTeksEntry("B.5A");
    expect(entry).not.toBeNull();
    expect(entry?.id).toBe("B.5A");
  });

  it("returns an entry for B.11A", () => {
    const entry = getTeksEntry("B.11A");
    expect(entry).not.toBeNull();
    expect(entry?.id).toBe("B.11A");
  });

  it("returns an entry for B.12B (Unit 7 — Processes in Plants)", () => {
    const entry = getTeksEntry("B.12B");
    expect(entry).not.toBeNull();
    expect(entry?.id).toBe("B.12B");
    expect(entry?.teaPriority).toBe("Priority Content");
  });

  it("returns null for an unknown TEKS code", () => {
    expect(getTeksEntry("B.99Z")).toBeNull();
  });

  it("normalizes the input before looking up (lowercase accepted)", () => {
    const entry = getTeksEntry("b.5a");
    expect(entry).not.toBeNull();
  });

  it("each known entry has an id, strand, title, description, and teaPriority", () => {
    const entry = getTeksEntry("B.7B");
    expect(entry).not.toBeNull();
    expect(typeof entry?.strand).toBe("string");
    expect(typeof entry?.title).toBe("string");
    expect(typeof entry?.description).toBe("string");
    expect(entry?.teaPriority).toBeDefined();
  });
});

describe("teksLabel", () => {
  it("returns 'id · title' for a known TEKS code", () => {
    const label = teksLabel("B.5A");
    expect(label).toMatch(/^B\.5A\s*·/);
  });

  it("returns just the normalized ID for an unknown TEKS", () => {
    expect(teksLabel("B.99Z")).toBe("B.99Z");
  });

  it("normalizes input before generating the label", () => {
    const lower = teksLabel("b.5a");
    const canonical = teksLabel("B.5A");
    expect(lower).toBe(canonical);
  });
});
