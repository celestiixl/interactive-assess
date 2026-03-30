"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TutorMessage, TutorTrigger, TutorChatResponse } from "@/types/tutor";

// ── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceAlt: "#13151f",
  panelBg: "#0d0f1a",
  border: "#2a2d3e",
  accent: "#6366f1",
  accentLight: "#818cf8",
  accentGlow: "rgba(99,102,241,0.35)",
  userBubble: "#312e81",
  userBubbleBorder: "#4338ca",
  assistantBubble: "#1a1d2e",
  assistantBubbleBorder: "#2a2d3e",
  text: "#e2e8f0",
  textSub: "#9abcb0",
  textMuted: "#64748b",
  textDim: "#94a3b8",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  inputBg: "#0a0c14",
  buttonBg: "#6366f1",
  headerBg: "#13151f",
  tier2: "#f59e0b",
  tier3: "#ef4444",
  tierNone: "#10b981",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  metadata?: TutorChatResponse;
}

export interface TutorWidgetProps {
  /** Lesson slug for the current lesson context */
  lessonSlug: string;
  /** Display label shown in the widget header */
  lessonLabel?: string;
  /** The authenticated student ID */
  studentId: string;
  /** What caused this invocation */
  triggeredBy?: TutorTrigger;
  /** Open the panel on mount */
  defaultOpen?: boolean;
  /** Position of the floating button on screen */
  position?: "bottom-right" | "bottom-left" | "inline";
}

// ── Main component ────────────────────────────────────────────────────────────
export function TutorWidget({
  lessonSlug,
  lessonLabel,
  studentId,
  triggeredBy = "student",
  defaultOpen = false,
  position = "bottom-right",
}: TutorWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [inputText, setInputText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [lastMetadata, setLastMetadata] = useState<TutorChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear unread when panel opens
  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || streaming) return;

    setError(null);
    setInputText("");

    const history: TutorMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-student-id": studentId,
        },
        body: JSON.stringify({
          message: text,
          lessonSlug,
          studentId,
          conversationHistory: history,
          triggeredBy,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(
          errData.message ?? `HTTP ${res.status}: ${errData.error ?? "unknown"}`,
        );
      }

      if (!res.body) throw new Error("Empty response body.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const visible = stripMetadataFooter(accumulated);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: visible };
          return next;
        });
      }

      const meta = extractMetadata(accumulated);
      const visible = stripMetadataFooter(accumulated);

      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: visible,
          metadata: meta ?? undefined,
        };
        return next;
      });

      if (meta) setLastMetadata(meta);
      if (!open) setUnreadCount((n) => n + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [inputText, lessonSlug, messages, open, streaming, studentId, triggeredBy]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setLastMetadata(null);
    setError(null);
  }, []);

  const tierColor =
    lastMetadata?.interventionTier === 3
      ? C.tier3
      : lastMetadata?.interventionTier === 2
        ? C.tier2
        : C.tierNone;

  const tierLabel =
    lastMetadata?.interventionTier === 3
      ? "Tier 3"
      : lastMetadata?.interventionTier === 2
        ? "Tier 2"
        : null;

  // Position styles for the floating wrapper
  const positionStyle: React.CSSProperties =
    position === "bottom-right"
      ? { position: "fixed", bottom: "88px", right: "24px", zIndex: 50 }
      : position === "bottom-left"
        ? { position: "fixed", bottom: "88px", left: "24px", zIndex: 50 }
        : { position: "relative" };

  return (
    <div style={positionStyle}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="tutor-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 16px)",
              right: position === "bottom-left" ? "auto" : 0,
              left: position === "bottom-left" ? 0 : "auto",
              width: "360px",
              maxHeight: "520px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "20px",
              overflow: "hidden",
              background: C.panelBg,
              border: `1px solid ${C.border}`,
              boxShadow:
                "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15)",
            }}
            role="dialog"
            aria-label="BioSpark Tutor chat"
            aria-modal="true"
          >
            {/* Panel header */}
            <PanelHeader
              lessonLabel={lessonLabel ?? lessonSlug}
              streaming={streaming}
              tierColor={tierLabel ? tierColor : undefined}
              tierLabel={tierLabel}
              teks={lastMetadata?.teks}
              onClear={clearChat}
              onClose={() => setOpen(false)}
              hasMessages={messages.length > 0}
            />

            {/* Messages */}
            <div
              ref={listRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                scrollbarWidth: "thin",
                scrollbarColor: `${C.border} transparent`,
              }}
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages.length === 0 && !error ? (
                <EmptyState lessonLabel={lessonLabel ?? lessonSlug} />
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MessageBubble entry={msg} />
                  </motion.div>
                ))
              )}
              {error && (
                <div
                  role="alert"
                  style={{
                    marginTop: "8px",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    background: "#1f0f0f",
                    border: `1px solid ${C.danger}`,
                    color: C.danger,
                  }}
                >
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>

            {/* Input */}
            <div
              style={{
                padding: "12px 14px",
                borderTop: `1px solid ${C.border}`,
                background: C.headerBg,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about this lesson..."
                  rows={2}
                  maxLength={500}
                  disabled={streaming}
                  aria-label="Message input"
                  style={{
                    flex: 1,
                    resize: "none",
                    background: C.inputBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    color: C.text,
                    outline: "none",
                    lineHeight: 1.5,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!inputText.trim() || streaming}
                  aria-label="Send message"
                  style={{
                    width: "40px",
                    height: "40px",
                    flexShrink: 0,
                    borderRadius: "10px",
                    background:
                      !inputText.trim() || streaming ? "#1a1d27" : C.accent,
                    border: `1px solid ${!inputText.trim() || streaming ? C.border : C.accent}`,
                    color: !inputText.trim() || streaming ? C.textMuted : "#fff",
                    cursor:
                      !inputText.trim() || streaming ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                >
                  <SendIcon />
                </button>
              </div>
              <p
                style={{
                  marginTop: "4px",
                  textAlign: "right",
                  fontSize: "10px",
                  color: C.textMuted,
                }}
              >
                {inputText.length}/500 · Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <TriggerButton
        open={open}
        streaming={streaming}
        unreadCount={unreadCount}
        onClick={() => setOpen((v) => !v)}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TriggerButton({
  open,
  streaming,
  unreadCount,
  onClick,
}: {
  open: boolean;
  streaming: boolean;
  unreadCount: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close tutor chat" : "Open tutor chat"}
      aria-expanded={open}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: `0 4px 20px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3)`,
        fontSize: "22px",
      }}
    >
      {/* Pulsing glow ring when streaming */}
      {streaming && (
        <span
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "50%",
            border: "2px solid rgba(99,102,241,0.6)",
            animation: "pulse-ring 1.2s ease-out infinite",
          }}
        />
      )}

      {/* Icon: DNA or X */}
      <AnimatePresence mode="wait">
        {open ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ color: "#fff", lineHeight: 1, fontSize: "18px", fontWeight: 700 }}
          >
            ✕
          </motion.span>
        ) : (
          <motion.span
            key="dna"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ lineHeight: 1 }}
          >
            🧬
          </motion.span>
        )}
      </AnimatePresence>

      {/* Unread badge */}
      {unreadCount > 0 && !open && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: C.danger,
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #0f1117",
          }}
          aria-label={`${unreadCount} unread message`}
        >
          {unreadCount}
        </span>
      )}

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </motion.button>
  );
}

function PanelHeader({
  lessonLabel,
  streaming,
  tierColor,
  tierLabel,
  teks,
  onClear,
  onClose,
  hasMessages,
}: {
  lessonLabel: string;
  streaming: boolean;
  tierColor?: string;
  tierLabel: string | null;
  teks?: string[];
  onClear: () => void;
  onClose: () => void;
  hasMessages: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: C.headerBg,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, #312e81 0%, #6366f1 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            boxShadow: streaming
              ? `0 0 14px rgba(99,102,241,0.8), 0 0 0 2px rgba(99,102,241,0.4)`
              : `0 0 8px rgba(99,102,241,0.3)`,
            transition: "box-shadow 0.3s ease",
          }}
          aria-hidden="true"
        >
          🧬
        </div>
        {/* Status dot */}
        <span
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: streaming ? C.accent : C.success,
            border: `2px solid ${C.headerBg}`,
            transition: "background 0.3s",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: C.text }}>
            BioSpark Tutor
          </p>
          {tierLabel && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: "6px",
                background: `${tierColor}22`,
                color: tierColor,
                border: `1px solid ${tierColor}44`,
              }}
            >
              {tierLabel}
            </span>
          )}
        </div>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "11px",
            color: streaming ? C.accentLight : C.textSub,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            transition: "color 0.3s",
          }}
        >
          {streaming ? "Thinking..." : lessonLabel}
        </p>
        {teks && teks.length > 0 && (
          <div style={{ display: "flex", gap: "4px", marginTop: "5px", flexWrap: "wrap" }}>
            {teks.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "1px 5px",
                  borderRadius: "5px",
                  background: "#1e2d3e",
                  color: "#67e8f9",
                  fontFamily: "monospace",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear conversation"
            title="Clear conversation"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.textMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            ↺
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close tutor chat"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.textMuted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function EmptyState({ lessonLabel }: { lessonLabel: string }) {
  const prompts = [
    "What is the role of ATP in cellular energy?",
    "Can you explain DNA base pairing rules?",
    "How do xylem and phloem work together?",
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0 12px",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
          boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
        }}
        aria-hidden="true"
      >
        🧬
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: C.text }}>
          Your AI Biology Tutor
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "11px",
            color: C.textMuted,
            lineHeight: 1.5,
            maxWidth: "240px",
          }}
        >
          I'll guide you through{" "}
          <span style={{ color: C.textDim }}>{lessonLabel}</span> with questions
          instead of direct answers.
        </p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
        <p style={{ margin: 0, fontSize: "10px", color: C.textMuted, textAlign: "center" }}>
          Try asking:
        </p>
        {prompts.map((p) => (
          <div
            key={p}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              background: "#1a1d2e",
              border: `1px solid ${C.border}`,
              fontSize: "11px",
              color: C.textDim,
              lineHeight: 1.4,
            }}
          >
            &ldquo;{p}&rdquo;
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ entry }: { entry: ChatEntry }) {
  const isUser = entry.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "10px",
        alignItems: "flex-end",
        gap: "8px",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          🧬
        </div>
      )}
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 13px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? C.userBubble : C.assistantBubble,
          border: `1px solid ${isUser ? C.userBubbleBorder : C.assistantBubbleBorder}`,
          fontSize: "13px",
          lineHeight: 1.55,
          color: isUser ? "#e0e7ff" : C.text,
        }}
      >
        {entry.content || (
          <span style={{ color: C.textMuted }}>
            <TypingDots />
          </span>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: "3px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: C.accent,
            display: "inline-block",
            animation: `typing-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing-dot {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </span>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
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

function stripMetadataFooter(text: string): string {
  const sep = text.lastIndexOf("\n\n");
  if (sep === -1) return text;
  const candidate = text.slice(sep + 2).trim();
  if (!candidate.startsWith("{")) return text;
  return text.slice(0, sep).trimEnd();
}
