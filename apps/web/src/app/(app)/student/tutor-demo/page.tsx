"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BackLink } from "@/components/nav/BackLink";
import PageBanner from "@/components/ui/PageBanner";
import { PageContent } from "@/components/ui/PageShell";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import type { TutorMessage, TutorTrigger, TutorChatResponse } from "@/types/tutor";

// ── Demo constants ────────────────────────────────────────────────────────────
const DEMO_STUDENT_ID = "demo-student-001";

const LESSON_OPTIONS: { slug: string; label: string }[] = [
  { slug: "biomolecules-and-cell-structure", label: "Biomolecules & Cell Structure (B.5A/B.5B)" },
  { slug: "cell-transport-and-homeostasis", label: "Cell Transport & Homeostasis (B.5C)" },
  { slug: "enzymes-photosynthesis-respiration", label: "Enzymes, Photosynthesis & Respiration (B.11A/B.11B)" },
  { slug: "dna-structure-and-replication", label: "DNA Structure & Replication (B.7A)" },
  { slug: "transcription-and-translation", label: "Transcription & Translation (B.7B)" },
  { slug: "mutations-and-significance", label: "Mutations & Significance (B.7C)" },
  { slug: "cell-growth", label: "Cell Growth" },
  { slug: "disruptions-cell-cycle", label: "Disruptions of the Cell Cycle" },
  { slug: "plant-transport-and-vascular-systems", label: "Plant Transport & Vascular Systems (B.12B)" },
  { slug: "plant-reproduction", label: "Plant Reproduction (B.12B)" },
  { slug: "plant-responses-and-hormones", label: "Plant Responses & Hormones (B.12B)" },
  { slug: "plant-systems-integration", label: "Plant Systems Integration (B.12B)" },
];

const TRIGGER_OPTIONS: { value: TutorTrigger; label: string; description: string }[] = [
  { value: "student", label: "Student-initiated", description: "Student opened the chat themselves" },
  { value: "wrong-answer", label: "Wrong answer", description: "Triggered after an incorrect quick-check answer" },
  { value: "failed-attempts", label: "Failed attempts", description: "Triggered after multiple failed attempts" },
  { value: "time-on-section", label: "Time on section", description: "Student has been stuck on a section too long" },
];

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  "2": { label: "Tier 2 — Targeted Support", color: "#f59e0b" },
  "3": { label: "Tier 3 — Intensive Support", color: "#ef4444" },
  null: { label: "No Intervention", color: "#10b981" },
};

// ── Dark-mode-aware color tokens ─────────────────────────────────────────────
const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceAlt: "#13151f",
  border: "#2a2d3e",
  borderLight: "#353850",
  accent: "#6366f1",
  accentHover: "#4f52d9",
  userBubble: "#312e81",
  userBubbleBorder: "#4338ca",
  assistantBubble: "#1e2033",
  assistantBubbleBorder: "#2a2d3e",
  text: "#e2e8f0",
  textMuted: "#64748b",
  textDim: "#94a3b8",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  inputBg: "#0d0f18",
  inputBorder: "#353850",
  inputFocus: "#6366f1",
  scrollThumb: "#2a2d3e",
  badge: "#1e2d3e",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  /** Only set after the stream finishes for assistant messages */
  metadata?: TutorChatResponse;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TutorDemoPage() {
  const [lessonSlug, setLessonSlug] = useState(LESSON_OPTIONS[0].slug);
  const [trigger, setTrigger] = useState<TutorTrigger>("student");
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [inputText, setInputText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [lastMetadata, setLastMetadata] = useState<TutorChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setLastMetadata(null);
    setError(null);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || streaming) return;

    setError(null);
    setInputText("");

    // Build the history from existing messages (strip metadata)
    const history: TutorMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);

    // Add placeholder assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-student-id": DEMO_STUDENT_ID,
        },
        body: JSON.stringify({
          message: text,
          lessonSlug,
          studentId: DEMO_STUDENT_ID,
          conversationHistory: history,
          triggeredBy: trigger,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(
          errData.message ?? `HTTP ${res.status}: ${errData.error ?? "unknown error"}`,
        );
      }

      if (!res.body) throw new Error("Response body is empty.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Update the assistant message in real-time, excluding the metadata footer
        const visibleText = stripMetadataFooter(accumulated);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: visibleText };
          return updated;
        });
      }

      // Parse the metadata footer from the full accumulated text
      const meta = extractMetadata(accumulated);
      const visibleText = stripMetadataFooter(accumulated);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: visibleText,
          metadata: meta ?? undefined,
        };
        return updated;
      });

      if (meta) setLastMetadata(meta);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      // Remove the empty assistant placeholder on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [inputText, lessonSlug, messages, streaming, trigger]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const currentLesson = LESSON_OPTIONS.find((l) => l.slug === lessonSlug);
  const currentTrigger = TRIGGER_OPTIONS.find((t) => t.value === trigger);

  return (
    <main
      className="ia-vh-page flex min-h-dvh flex-col"
      style={{ background: C.bg, color: C.text }}
    >
      <BackLink href="/student/dashboard" label="Back to dashboard" />

      <PageBanner
        title="BioSpark Tutor Demo"
        subtitle="Live demo of the AI tutor chat — select a lesson and start a conversation"
      />

      <PageContent className="flex-1 py-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* ── Settings sidebar ─────────────────────────────────────── */}
          <aside
            className="flex flex-col gap-4 rounded-2xl p-5"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
              Demo Settings
            </h2>

            {/* Lesson selector */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="lesson-select"
                className="text-xs font-medium"
                style={{ color: C.textDim }}
              >
                Lesson
              </label>
              <select
                id="lesson-select"
                value={lessonSlug}
                onChange={(e) => {
                  setLessonSlug(e.target.value);
                  clearChat();
                }}
                aria-label="Select lesson"
                className="rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2"
                style={{
                  background: C.inputBg,
                  border: `1px solid ${C.inputBorder}`,
                  color: C.text,
                  // Focus ring via inline not supported easily; use CSS class
                }}
              >
                {LESSON_OPTIONS.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trigger selector */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="trigger-select"
                className="text-xs font-medium"
                style={{ color: C.textDim }}
              >
                Trigger (why tutor was invoked)
              </label>
              <select
                id="trigger-select"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value as TutorTrigger)}
                aria-label="Select trigger"
                className="rounded-lg px-3 py-2 text-sm outline-none transition"
                style={{
                  background: C.inputBg,
                  border: `1px solid ${C.inputBorder}`,
                  color: C.text,
                }}
              >
                {TRIGGER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {currentTrigger && (
                <p className="text-[11px]" style={{ color: C.textMuted }}>
                  {currentTrigger.description}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: C.border }} />

            {/* Active context */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textMuted }}>
                Active Context
              </span>
              <div
                className="rounded-xl p-3 text-xs"
                style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
              >
                <p className="font-medium" style={{ color: C.textDim }}>
                  Lesson
                </p>
                <p className="mt-0.5 font-semibold" style={{ color: C.text }}>
                  {currentLesson?.label ?? lessonSlug}
                </p>
                <p className="mt-2 font-medium" style={{ color: C.textDim }}>
                  Student ID
                </p>
                <p
                  className="mt-0.5 rounded px-1.5 py-0.5 font-mono text-[11px]"
                  style={{ background: C.badge, color: C.accent, display: "inline-block" }}
                >
                  {DEMO_STUDENT_ID}
                </p>
              </div>
            </div>

            {/* Intervention metadata (shown after first response) */}
            {lastMetadata && (
              <>
                <div className="h-px" style={{ background: C.border }} />
                <div className="flex flex-col gap-2">
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: C.textMuted }}
                  >
                    Tutor Metadata
                  </span>
                  <MetadataCard meta={lastMetadata} />
                </div>
              </>
            )}

            {/* Clear button */}
            <div className="mt-auto">
              <button
                type="button"
                onClick={clearChat}
                disabled={messages.length === 0 && !error}
                aria-label="Clear conversation"
                className="w-full rounded-xl px-4 py-2 text-sm font-medium transition"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.borderLight}`,
                  color: messages.length > 0 ? C.text : C.textMuted,
                  cursor: messages.length === 0 && !error ? "not-allowed" : "pointer",
                  opacity: messages.length === 0 && !error ? 0.5 : 1,
                }}
              >
                Clear conversation
              </button>
            </div>
          </aside>

          {/* ── Chat panel ───────────────────────────────────────────── */}
          <section
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              minHeight: "560px",
            }}
          >
            {/* Chat header */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                style={{ background: C.accent, color: "#fff" }}
                aria-hidden="true"
              >
                🧬
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: C.text }}>
                  BioSpark Tutor
                </p>
                <p className="text-xs" style={{ color: C.textMuted }}>
                  {streaming ? "Typing..." : "Ready to help"}
                </p>
              </div>
              {streaming && (
                <div className="ml-auto flex gap-1" aria-live="polite" aria-label="Tutor is typing">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: C.accent,
                        animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Message list */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-5"
              style={{ scrollbarColor: `${C.scrollThumb} transparent` }}
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages.length === 0 && !error && (
                <EmptyState lessonLabel={currentLesson?.label ?? lessonSlug} />
              )}

              {messages.map((msg, i) => (
                <MessageBubble key={i} entry={msg} />
              ))}

              {error && (
                <div
                  className="mx-auto mt-4 max-w-md rounded-xl px-4 py-3 text-sm"
                  role="alert"
                  style={{
                    background: "#1f0f0f",
                    border: `1px solid ${C.danger}`,
                    color: C.danger,
                  }}
                >
                  <span className="font-semibold">Error: </span>
                  {error}
                </div>
              )}
            </div>

            {/* Input area */}
            <div
              className="px-5 py-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask BioSpark Tutor anything about this lesson... (Enter to send)"
                  rows={2}
                  maxLength={500}
                  disabled={streaming}
                  aria-label="Message input"
                  className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition"
                  style={{
                    background: C.inputBg,
                    border: `1px solid ${C.inputBorder}`,
                    color: C.text,
                    lineHeight: "1.5",
                  }}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!inputText.trim() || streaming}
                  aria-label="Send message"
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition"
                  style={{
                    background:
                      !inputText.trim() || streaming ? C.surfaceAlt : C.accent,
                    border: `1px solid ${!inputText.trim() || streaming ? C.border : C.accent}`,
                    color:
                      !inputText.trim() || streaming ? C.textMuted : "#fff",
                    cursor:
                      !inputText.trim() || streaming ? "not-allowed" : "pointer",
                  }}
                >
                  <SendIcon />
                </button>
              </div>
              <p className="mt-1.5 text-right text-[11px]" style={{ color: C.textMuted }}>
                {inputText.length}/500 · Shift+Enter for new line
              </p>
            </div>
          </section>
        </div>
      </PageContent>

      {/* Typing animation keyframes injected inline */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>

      <StudentFloatingDock />
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ lessonLabel }: { lessonLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
        style={{ background: "#1e2033", border: `1px solid ${C.border}` }}
      >
        🧬
      </div>
      <p className="text-sm font-semibold" style={{ color: C.text }}>
        Start a conversation
      </p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed" style={{ color: C.textMuted }}>
        Ask a question about <span style={{ color: C.textDim }}>{lessonLabel}</span>.
        The tutor will guide you with questions rather than giving direct answers.
      </p>
      <div
        className="mt-4 rounded-xl px-4 py-2.5 text-xs"
        style={{ background: "#1e2033", border: `1px solid ${C.border}`, color: C.textDim }}
      >
        💡 Try: &ldquo;What is the difference between prokaryotic and eukaryotic cells?&rdquo;
      </div>
    </div>
  );
}

function MessageBubble({ entry }: { entry: ChatEntry }) {
  const isUser = entry.role === "user";

  if (isUser) {
    return (
      <div className="mb-4 flex justify-end">
        <div
          className="max-w-[72%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: C.userBubble,
            border: `1px solid ${C.userBubbleBorder}`,
            color: "#e0e7ff",
          }}
        >
          {entry.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start gap-3">
      <div
        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm"
        style={{ background: C.accent, color: "#fff" }}
        aria-hidden="true"
      >
        🧬
      </div>
      <div className="flex-1">
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: C.assistantBubble,
            border: `1px solid ${C.assistantBubbleBorder}`,
            color: C.text,
          }}
        >
          {entry.content || (
            <span style={{ color: C.textMuted }}>
              <span className="animate-pulse">●●●</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MetadataCard({ meta }: { meta: TutorChatResponse }) {
  const tierKey = String(meta.interventionTier) as keyof typeof TIER_LABELS;
  const tier = TIER_LABELS[tierKey] ?? TIER_LABELS["null"];

  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: tier.color }}
          aria-hidden="true"
        />
        <span className="font-semibold" style={{ color: tier.color }}>
          {tier.label}
        </span>
      </div>
      {meta.teks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {meta.teks.map((t) => (
            <span
              key={t}
              className="rounded px-1.5 py-0.5 font-mono font-semibold"
              style={{ background: "#1e2d3e", color: "#67e8f9", fontSize: "10px" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

// ── Streaming helpers ─────────────────────────────────────────────────────────

/**
 * The API appends a JSON metadata footer after a `\n\n` separator.
 * Extract it from the accumulated text. Returns null if not found.
 */
function extractMetadata(text: string): TutorChatResponse | null {
  const sep = text.lastIndexOf("\n\n");
  if (sep === -1) return null;
  const candidate = text.slice(sep + 2).trim();
  if (!candidate.startsWith("{")) return null;
  try {
    return JSON.parse(candidate) as TutorChatResponse;
  } catch {
    return null;
  }
}

/**
 * Return the visible tutor text without the JSON metadata footer.
 */
function stripMetadataFooter(text: string): string {
  const sep = text.lastIndexOf("\n\n");
  if (sep === -1) return text;
  const candidate = text.slice(sep + 2).trim();
  if (!candidate.startsWith("{")) return text;
  return text.slice(0, sep).trimEnd();
}
