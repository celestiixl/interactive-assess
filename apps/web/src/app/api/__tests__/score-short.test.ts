/**
 * Tests for POST /api/score/short
 */
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/score/short/route";

function jsonRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/score/short", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/score/short", () => {
  it("returns ok:true", async () => {
    const res = await POST(
      jsonRequest({
        text: "During photosynthesis, plants take in CO2 and water to produce glucose and oxygen using light energy.",
        rubric: {
          criteria: ["mentions CO2", "mentions glucose"],
          points: 2,
        },
      }),
    );
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("awards score when keywords are present", async () => {
    const res = await POST(
      jsonRequest({
        text: "Plants use CO2 and water to make glucose with light.",
        rubric: {
          criteria: ["CO2", "glucose"],
          points: 2,
        },
      }),
    );
    const data = await res.json();
    expect(data.score).toBeGreaterThan(0);
  });

  it("score does not exceed max", async () => {
    const res = await POST(
      jsonRequest({
        text: "CO2, water, glucose, oxygen, light energy, ATP, conserve matter via law of conservation.",
        rubric: {
          criteria: ["c1", "c2", "c3"],
          points: 2,
        },
      }),
    );
    const data = await res.json();
    expect(data.score).toBeLessThanOrEqual(data.max);
  });

  it("score is at least 0", async () => {
    const res = await POST(jsonRequest({ text: "", rubric: { criteria: ["x"], points: 1 } }));
    const data = await res.json();
    expect(data.score).toBeGreaterThanOrEqual(0);
  });

  it("returns reasons array with one entry per rubric criterion", async () => {
    const res = await POST(
      jsonRequest({
        text: "Some text about glucose.",
        rubric: { criteria: ["a", "b", "c"], points: 3 },
      }),
    );
    const data = await res.json();
    expect(Array.isArray(data.reasons)).toBe(true);
    expect(data.reasons).toHaveLength(3);
  });

  it("handles missing rubric gracefully (defaults to 0 criteria)", async () => {
    const res = await POST(jsonRequest({ text: "some answer" }));
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.score).toBe(0);
  });

  it("recognises CO2/carbon dioxide variants", async () => {
    const res1 = await POST(
      jsonRequest({ text: "CO2 goes in", rubric: { criteria: ["CO2"], points: 1 } }),
    );
    const res2 = await POST(
      jsonRequest({
        text: "carbon dioxide goes in",
        rubric: { criteria: ["CO2"], points: 1 },
      }),
    );
    const d1 = await res1.json();
    const d2 = await res2.json();
    expect(d1.score).toBeGreaterThan(0);
    expect(d2.score).toBeGreaterThan(0);
  });

  it("recognises glucose/c6h12o6 variants", async () => {
    const res = await POST(
      jsonRequest({
        text: "the product is c6h12o6",
        rubric: { criteria: ["glucose"], points: 1 },
      }),
    );
    const data = await res.json();
    expect(data.score).toBeGreaterThan(0);
  });
});
