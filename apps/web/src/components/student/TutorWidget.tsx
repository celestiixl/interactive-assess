"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TutorMessage, TutorTrigger, TutorChatResponse } from "@/types/tutor";
import { useTutorPermissions } from "@/hooks/useTutorPermissions";

// BioSpark color tokens
const C = {
  bg: "#0d1e2c",
  surface: "#132638",
  header: "#1a3148",
  accent: "#00d4aa",
  danger: "#ff6b6b",
  textSub: "#9abcb0",
  text: "#e8f4f0",
  textMuted: "#5a8070",
  textDim: "#9abcb0",
  inputBg: "#0d1e2c",
  border: "#1e3547",
  userBubble: "#00543f",
  userBubbleBorder: "#00d4aa",
  assistantBubble: "#132638",
  assistantBubbleBorder: "#1e3547",
  success: "#00d4aa",
  warning: "#f59e0b",
  tier2: "#f59e0b",
  tier3: "#ff6b6b",
  tierNone: "#00d4aa",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  metadata?: TutorChatResponse;
}

export interface TutorWidgetProps {
  /** Lesson slug for the current lesson context (optional when used globally) */
  lessonSlug?: string;
  /** Display label shown in the widget header */
  lessonLabel?: string;
  /** Lesson title - alias for lessonLabel when injected from layout */
  lessonTitle?: string;
  /** TEKS standards associated with the current lesson */
  teks?: string[];
  /** The authenticated student ID (optional - reads from profile store if omitted) */
  studentId?: string;
  /** What caused this invocation */
  triggeredBy?: TutorTrigger;
  /** Open the panel on mount */
  defaultOpen?: boolean;
  /** Position of the floating button on screen */
  position?: "bottom-right" | "bottom-left" | "inline";
}

const POSITION_STORAGE_KEY = "biospark:tutor:position";

function readSavedPosition(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { x: number; y: number };
  } catch {
    return null;
  }
}

function writeSavedPosition(pos: { x: number; y: number }): void {
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // ignore
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export function TutorWidget({
  lessonSlug = "general",
  lessonLabel,
  lessonTitle,
  teks,
  studentId = "student",
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
  // Drag state - offset from bottom-right corner
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; posX: number; posY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const { hideForStudent } = useTutorPermissions();

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore saved drag position on mount
  useEffect(() => {
    const saved = readSavedPosition();
    if (saved) setDragPos(saved);
  }, []);

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

  // Drag handlers using pointer events
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!widgetRef.current) return;
      // Prevent text selection during drag
      e.preventDefault();
      const rect = widgetRef.current.getBoundingClientRect();
      // Track offset from current fixed position (right/bottom from viewport edge)
      const currentX = dragPos?.x ?? (window.innerWidth - rect.right);
      const currentY = dragPos?.y ?? (window.innerHeight - rect.bottom);
      dragStartRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        posX: currentX,
        posY: currentY,
      };
      widgetRef.current.setPointerCapture(e.pointerId);
    },
    [dragPos],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.pointerX;
      const dy = e.clientY - dragStartRef.current.pointerY;
      const newX = Math.max(0, dragStartRef.current.posX - dx);
      const newY = Math.max(0, dragStartRef.current.posY - dy);
      const pos = { x: newX, y: newY };
      setDragPos(pos);
    },
    [],
  );

  const handlePointerUp = useCallback(
    (_e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current) return;
      // Persist final position
      if (dragPos) writeSavedPosition(dragPos);
      dragStartRef.current = null;
    },
    [dragPos],
  );

  const displayLabel = lessonTitle ?? lessonLabel ?? lessonSlug;
  const displayTeks = teks ?? lastMetadata?.teks;

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
    position === "inline"
      ? { position: "relative" }
      : dragPos
        ? {
            position: "fixed",
            bottom: `${dragPos.y}px`,
            right: `${dragPos.x}px`,
            zIndex: 50,
          }
        : position === "bottom-left"
          ? { position: "fixed", bottom: "24px", left: "24px", zIndex: 50 }
          : { position: "fixed", bottom: "24px", right: "24px", zIndex: 50 };

  return (
    <div
      ref={widgetRef}
      style={positionStyle}
      onPointerDown={position !== "inline" ? handlePointerDown : undefined}
      onPointerMove={position !== "inline" ? handlePointerMove : undefined}
      onPointerUp={position !== "inline" ? handlePointerUp : undefined}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            key="tutor-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 12px)",
              right: position === "bottom-left" ? "auto" : 0,
              left: position === "bottom-left" ? 0 : "auto",
              width: "320px",
              height: "420px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              overflow: "hidden",
              background: C.bg,
              border: `1px solid ${C.border}`,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,170,0.1)",
            }}
            role="dialog"
            aria-label="BioSpark Tutor chat"
            aria-modal="true"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <PanelHeader
              lessonLabel={displayLabel}
              streaming={streaming}
              tierColor={tierLabel ? tierColor : undefined}
              tierLabel={tierLabel}
              teks={displayTeks}
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
                background: C.bg,
                scrollbarWidth: "thin",
                scrollbarColor: `${C.border} transparent`,
              }}
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages.length === 0 && !error ? (
                <EmptyState lessonLabel={displayLabel} />
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
                    background: "#1a0d0d",
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
                background: C.header,
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
                      !inputText.trim() || streaming ? C.surface : C.accent,
                    border: `1px solid ${!inputText.trim() || streaming ? C.border : C.accent}`,
                    color: !inputText.trim() || streaming ? C.textMuted : "#0d1e2c",
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
              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    hideForStudent();
                    setOpen(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: "11px",
                    color: C.textMuted,
                    textDecoration: "underline",
                    fontFamily: "inherit",
                  }}
                >
                  Hide tutor
                </button>
                <p
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    color: C.textMuted,
                  }}
                >
                  {inputText.length}/500
                </p>
              </div>
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
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: C.accent,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: `0 4px 20px rgba(0,212,170,0.4), 0 0 0 1px rgba(0,212,170,0.2)`,
        fontSize: "20px",
        color: "#0d1e2c",
      }}
    >
      {/* Pulsing glow ring when streaming */}
      {streaming && (
        <span
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "50%",
            border: "2px solid rgba(0,212,170,0.6)",
            animation: "tutor-pulse-ring 1.2s ease-out infinite",
          }}
        />
      )}

      {/* Icon: spark or X */}
      <AnimatePresence mode="wait">
        {open ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ color: "#0d1e2c", lineHeight: 1, fontSize: "16px", fontWeight: 700 }}
          >
            ✕
          </motion.span>
        ) : (
          <motion.span
            key="spark"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ lineHeight: 1 }}
          >
            ✦
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
            border: `2px solid ${C.bg}`,
          }}
          aria-label={`${unreadCount} unread message`}
        >
          {unreadCount}
        </span>
      )}

      <style>{`
        @keyframes tutor-pulse-ring {
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
        background: C.header,
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
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: C.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            color: "#0d1e2c",
            boxShadow: streaming
              ? `0 0 14px rgba(0,212,170,0.6), 0 0 0 2px rgba(0,212,170,0.3)`
              : `0 0 8px rgba(0,212,170,0.2)`,
            transition: "box-shadow 0.3s ease",
          }}
          aria-hidden="true"
        >
          ✦
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
            background: streaming ? C.warning : C.success,
            border: `2px solid ${C.header}`,
            transition: "background 0.3s",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: C.text, fontFamily: "Syne, sans-serif" }}>
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
            color: streaming ? C.accent : C.textSub,
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
                  background: "#0d2a1f",
                  color: C.accent,
                  fontFamily: "monospace",
                  border: `1px solid rgba(0,212,170,0.2)`,
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
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: C.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          color: "#0d1e2c",
          boxShadow: "0 8px 24px rgba(0,212,170,0.3)",
        }}
        aria-hidden="true"
      >
        ✦
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: C.text, fontFamily: "Syne, sans-serif" }}>
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
          I will guide you through{" "}
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
              background: C.surface,
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
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            background: C.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            color: "#0d1e2c",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          ✦
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
          color: isUser ? C.text : C.text,
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

// Streaming helpers
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
