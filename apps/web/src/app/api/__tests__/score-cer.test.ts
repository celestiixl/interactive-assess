/**
 * Tests for POST /api/score/cer
 */
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/score/cer/route";

function jsonRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/score/cer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const baseItem = {
  correctEvidenceIds: ["ev1", "ev2"],
  rubric: { evidencePoints: 2 },
  evidenceBank: [
    { id: "ev1", tag: "supports" },
    { id: "ev2", tag: "supports" },
    { id: "ev3", tag: "contradicts" },
  ],
  constraints: { minEvidence: 1, maxEvidence: 3, reasoningMinChars: 60 },
};

const baseResponse = {
  selectedEvidenceIds: ["ev1", "ev2"],
  reasoningText: "This is my reasoning text that is long enough to satisfy the minimum character check.",
  claimText: "My claim",
};

describe("POST /api/score/cer", () => {
  it("returns ok:true for a valid request", async () => {
    const res = await POST(jsonRequest({ item: baseItem, response: baseResponse }));
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("returns 400 when item is missing", async () => {
    const res = await POST(jsonRequest({ response: baseResponse }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when response is missing", async () => {
    const res = await POST(jsonRequest({ item: baseItem }));
    expect(res.status).toBe(400);
  });

  it("awards full evidence score when all correct IDs are selected", async () => {
    const res = await POST(jsonRequest({ item: baseItem, response: baseResponse }));
    const data = await res.json();
    expect(data.autoScore.evidence).toBe(2);
  });

  it("awards partial credit for partial selection", async () => {
    const res = await POST(
      jsonRequest({
        item: baseItem,
        response: { ...baseResponse, selectedEvidenceIds: ["ev1"] },
      }),
    );
    const data = await res.json();
    expect(data.autoScore.evidence).toBe(1);
  });

  it("awards 0 credit when wrong evidence is selected", async () => {
    const res = await POST(
      jsonRequest({
        item: baseItem,
        response: { ...baseResponse, selectedEvidenceIds: ["ev3"] },
      }),
    );
    const data = await res.json();
    expect(data.autoScore.evidence).toBe(0);
  });

  it("provides feedback when incorrect evidence is selected", async () => {
    const res = await POST(
      jsonRequest({
        item: baseItem,
        response: { ...baseResponse, selectedEvidenceIds: ["ev3"] },
      }),
    );
    const data = await res.json();
    expect(data.autoScore.feedback).toBeInstanceOf(Array);
    expect(data.autoScore.feedback.length).toBeGreaterThan(0);
  });

  it("echoes back the response in the result", async () => {
    const res = await POST(jsonRequest({ item: baseItem, response: baseResponse }));
    const data = await res.json();
    expect(data.response).toEqual(baseResponse);
  });

  it("uses constraint validation when no correctEvidenceIds is defined", async () => {
    const itemNoKey = {
      ...baseItem,
      correctEvidenceIds: undefined,
      constraints: { minEvidence: 2, maxEvidence: 3, reasoningMinChars: 20 },
    };
    const response = {
      ...baseResponse,
      selectedEvidenceIds: ["ev1"], // only 1, but min is 2
      reasoningText: "Short enough",
    };
    const res = await POST(jsonRequest({ item: itemNoKey, response }));
    const data = await res.json();
    expect(data.autoScore.feedback.some((f: string) => /at least/i.test(f))).toBe(true);
  });
});
