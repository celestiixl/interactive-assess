/**
 * Tests for GET and POST /api/mastery (Neon Postgres-backed)
 *
 * These tests exercise the API contract without a live DB connection.
 * The handlers return empty arrays / error JSON when DATABASE_URL is absent.
 */
import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/mastery/route";

function getRequest(params: Record<string, string>): Request {
  const url = new URL("http://localhost/api/mastery");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new Request(url.toString(), { method: "GET" });
}

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/mastery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// --- GET /api/mastery ---------------------------------------------------------

describe("GET /api/mastery", () => {
  it("returns 200 with an empty array when studentId is missing", async () => {
    const res = await GET(getRequest({}));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it("returns 200 with an empty array when studentId is provided but DB is unavailable", async () => {
    const res = await GET(getRequest({ studentId: "student-1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

// --- POST /api/mastery --------------------------------------------------------

describe("POST /api/mastery", () => {
  it("returns 400 when teks is missing", async () => {
    const res = await POST(
      postRequest({ score: 80, lessonSlug: "lab-safety" }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing required fields: teks and score are required");
  });

  it("returns 400 when score is missing", async () => {
    const res = await POST(
      postRequest({ teks: "B.5A", lessonSlug: "lab-safety" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 when DB is unavailable (valid payload, no DB)", async () => {
    const res = await POST(
      postRequest({ teks: "B.5A", score: 85, lessonSlug: "biomolecules-intro" }),
    );
    // No live DB - handler catches the error and returns 500
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Failed to save");
  });

  it("accepts POST without studentId, defaulting to anonymous", async () => {
    // Mirrors the ecological-succession simulation which omits studentId
    const res = await POST(
      postRequest({ teks: "B.6D", score: 1, lessonSlug: "ecological-succession" }),
    );
    // DB unavailable in test env - expects 500, not 400
    expect(res.status).toBe(500);
  });

  it("accepts POST without correct field, inferring from score", async () => {
    const res = await POST(
      postRequest({ studentId: "s1", teks: "B.11A", score: 0.8, lessonSlug: "energy" }),
    );
    // DB unavailable in test env - expects 500, not 400
    expect(res.status).toBe(500);
  });
});
