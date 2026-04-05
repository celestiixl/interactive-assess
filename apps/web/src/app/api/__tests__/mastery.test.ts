/**
 * Tests for GET and PATCH /api/mastery
 *
 * The current route:
 *   GET  /api/mastery?studentId=xxx  → flat map { "B.5A": 0.82, ... }
 *   PATCH /api/mastery               → upsert mastery record { studentId, teks, score (0-1) }
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock Prisma so tests run without a real database.
// vi.mock is hoisted, so factories must not reference outer variables.
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    masteryRecord: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { GET, PATCH, POST } from "@/app/api/mastery/route";
import { prisma } from "@/lib/prisma";

const mockFindMany = vi.mocked(prisma.masteryRecord.findMany);
const mockUpsert = vi.mocked(prisma.masteryRecord.upsert);

function getRequest(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost/api/mastery");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url.toString(), { method: "GET" });
}

function patchRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/mastery", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── GET /api/mastery ─────────────────────────────────────────────────────────

describe("GET /api/mastery", () => {
  beforeEach(() => {
    mockFindMany.mockResolvedValue([]);
  });

  it("returns 400 when studentId is missing", async () => {
    const res = await GET(getRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns a flat mastery map for a valid studentId", async () => {
    mockFindMany.mockResolvedValueOnce([
      { id: "r1", studentId: "student-1", teks: "B.5A", score: 0.82, updatedAt: new Date() },
      { id: "r2", studentId: "student-1", teks: "B.7B", score: 0.64, updatedAt: new Date() },
    ]);
    const res = await GET(getRequest({ studentId: "student-1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data["B.5A"]).toBe(0.82);
    expect(data["B.7B"]).toBe(0.64);
  });

  it("returns an empty object when student has no mastery records", async () => {
    mockFindMany.mockResolvedValueOnce([]);
    const res = await GET(getRequest({ studentId: "new-student" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Object.keys(data)).toHaveLength(0);
  });
});

// ─── PATCH /api/mastery ───────────────────────────────────────────────────────

describe("PATCH /api/mastery", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUpsert.mockResolvedValue({ id: "rec-1", studentId: "s1", teks: "B.5A", score: 0.85 } as any);
  });

  it("returns 200 for a valid payload", async () => {
    const res = await PATCH(patchRequest({ studentId: "s1", teks: "B.5A", score: 0.85 }));
    expect(res.status).toBe(200);
  });

  it("returns 400 when studentId is missing", async () => {
    const res = await PATCH(patchRequest({ teks: "B.5A", score: 0.8 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when teks is missing", async () => {
    const res = await PATCH(patchRequest({ studentId: "s1", score: 0.8 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when score is missing", async () => {
    const res = await PATCH(patchRequest({ studentId: "s1", teks: "B.5A" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when teks format is invalid", async () => {
    const res = await PATCH(patchRequest({ studentId: "s1", teks: "b5a", score: 0.8 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when score is out of range", async () => {
    const res = await PATCH(patchRequest({ studentId: "s1", teks: "B.5A", score: 1.5 }));
    expect(res.status).toBe(400);
  });
});

// ─── POST aliased to PATCH ────────────────────────────────────────────────────

describe("POST /api/mastery (backward-compat alias)", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUpsert.mockResolvedValue({ id: "rec-2", studentId: "s2", teks: "B.11A", score: 0.7 } as any);
  });

  it("POST returns 200 for a valid payload", async () => {
    const req = new NextRequest("http://localhost/api/mastery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: "s2", teks: "B.11A", score: 0.7 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

