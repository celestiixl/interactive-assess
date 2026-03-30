import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { TutorChatRequest, TutorChatResponse } from "@/types/tutor";
import { LEARNING_UNITS } from "@/lib/learningHubContent";
import { buildTutorSystemPrompt } from "@/lib/tutor";
import {
  computeInterventionTier,
  deriveLearningLevel,
} from "@/lib/intelligence";

export const runtime = "nodejs";

const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY_ENTRIES = 20;

/**
 * Module-level singleton Anthropic client.
 * Initialised on first request and reused across warm invocations.
 * Throws at call time (not at module load) so missing env vars surface as
 * a proper HTTP 503 rather than a build-time crash.
 */
let _anthropicClient: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (_anthropicClient) return _anthropicClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set.");
  }
  _anthropicClient = new Anthropic({ apiKey });
  return _anthropicClient;
}

/**
 * Find a lesson across all curriculum units by its slug.
 * Returns undefined if no lesson matches.
 */
function findLessonBySlug(lessonSlug: string) {
  for (const unit of LEARNING_UNITS) {
    const lesson = unit.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) return { unit, lesson };
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// POST /api/tutor/chat
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // ------------------------------------------------------------------
  // 1. Auth check — student role required.
  //    The platform does not yet have a server-side session layer; the
  //    convention (matching /api/teacher/* routes) is to require a
  //    non-empty x-student-id header as a lightweight role indicator.
  //    Replace with a real session check once auth is wired up.
  // ------------------------------------------------------------------
  const studentIdHeader = req.headers.get("x-student-id")?.trim();
  if (!studentIdHeader) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message:
          "A valid x-student-id header is required to access the tutor.",
      },
      { status: 401 },
    );
  }

  // ------------------------------------------------------------------
  // 2. Parse and validate request body
  // ------------------------------------------------------------------
  let body: TutorChatRequest;
  try {
    body = (await req.json()) as TutorChatRequest;
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { message, lessonSlug, studentId, conversationHistory, triggeredBy } =
    body;

  // Ensure the authenticated header identity matches the request body identity
  // to prevent one student from querying mastery data on behalf of another.
  if (studentId !== studentIdHeader) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "studentId in the request body must match the x-student-id header.",
      },
      { status: 401 },
    );
  }
  if (!message || message.trim() === "") {
    return NextResponse.json(
      { error: "invalid_message", message: "message must not be empty." },
      { status: 400 },
    );
  }

  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      {
        error: "message_too_long",
        message: `message must be ${MAX_MESSAGE_CHARS} characters or fewer.`,
      },
      { status: 400 },
    );
  }

  if (!lessonSlug || lessonSlug.trim() === "") {
    return NextResponse.json(
      { error: "invalid_lesson", message: "lessonSlug is required." },
      { status: 400 },
    );
  }

  if (!Array.isArray(conversationHistory)) {
    return NextResponse.json(
      {
        error: "invalid_history",
        message: "conversationHistory must be an array.",
      },
      { status: 400 },
    );
  }

  if (conversationHistory.length > MAX_HISTORY_ENTRIES) {
    return NextResponse.json(
      {
        error: "history_too_long",
        message: `conversationHistory must have at most ${MAX_HISTORY_ENTRIES} entries.`,
      },
      { status: 400 },
    );
  }

  // ------------------------------------------------------------------
  // 3. Load the lesson from curriculum data
  // ------------------------------------------------------------------
  const found = findLessonBySlug(lessonSlug);
  if (!found) {
    return NextResponse.json(
      {
        error: "lesson_not_found",
        message: `No lesson found with slug "${lessonSlug}".`,
      },
      { status: 400 },
    );
  }
  const { lesson } = found;

  // ------------------------------------------------------------------
  // 4. Derive learningLevel and interventionTier from mastery data.
  //    The mastery API returns a mock deterministic value today; this
  //    will be replaced with real persistence once the data layer is wired.
  // ------------------------------------------------------------------
  let learningLevel: "developing" | "progressing" | "proficient" | "advanced" =
    "developing";
  let interventionTier: 2 | 3 | null = null;

  try {
    const masteryUrl = new URL(
      "/api/mastery",
      `${req.nextUrl.protocol}//${req.nextUrl.host}`,
    );
    masteryUrl.searchParams.set("userId", studentIdHeader);
    masteryUrl.searchParams.set(
      "itemIds",
      (lesson.teks ?? []).join(",") || lessonSlug,
    );

    const masteryRes = await fetch(masteryUrl.toString());
    if (masteryRes.ok) {
      const masteryData = (await masteryRes.json()) as {
        items: Record<string, { masteryPct: number; total: number }>;
      };

      const teks = lesson.teks ?? [];
      if (teks.length > 0 && masteryData.items) {
        const firstTeksData = masteryData.items[teks[0]];
        if (firstTeksData) {
          learningLevel = deriveLearningLevel(firstTeksData.masteryPct);
          // Use masteryPct as a 0-1 score and assume 0 failed attempts for the
          // initial request since detailed attempt history is not yet persisted.
          interventionTier = computeInterventionTier(
            firstTeksData.masteryPct / 100,
            0,
          );
        }
      }
    }
  } catch {
    // Mastery fetch failure is non-fatal; fall back to defaults.
  }

  // ------------------------------------------------------------------
  // 5. Build the system prompt
  // ------------------------------------------------------------------
  const systemPrompt = buildTutorSystemPrompt(
    lesson,
    learningLevel,
    interventionTier,
    triggeredBy,
  );

  // ------------------------------------------------------------------
  // 6. Stream the Anthropic response back to the client
  // ------------------------------------------------------------------
  const messagesForAnthropic: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  let anthropicClient: Anthropic;
  try {
    anthropicClient = getAnthropicClient();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Configuration error.";
    return NextResponse.json(
      { error: "service_unavailable", message: msg },
      { status: 503 },
    );
  }

  const encoder = new TextEncoder();

  const metadata: TutorChatResponse = {
    interventionTier,
    lessonSlug,
    teks: lesson.teks ?? [],
  };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await anthropicClient.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: systemPrompt,
          messages: messagesForAnthropic,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // ------------------------------------------------------------------
        // 7. Append JSON metadata footer after the streamed text
        // ------------------------------------------------------------------
        const footer = `\n\n${JSON.stringify(metadata)}`;
        controller.enqueue(encoder.encode(footer));
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Anthropic stream error.";
        controller.enqueue(
          encoder.encode(`\n\n${JSON.stringify({ error: msg })}`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
