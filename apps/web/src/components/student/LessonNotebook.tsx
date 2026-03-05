"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  type LessonNotebook as LessonNotebookData,
  type NotebookObservation,
  loadNotebook,
  notebookHasContent,
  saveNotebook,
} from "@/lib/lessonNotebook";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SKETCH_COLORS = [
  "#1e293b", // slate-800 (default pen)
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#22c55e", // green-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#ffffff", // white (erase via color)
] as const;

const STROKE_WIDTHS = [2, 4, 8, 14] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "notes" | "sketch" | "observations";

interface Props {
  lessonSlug: string;
  studentId: string;
}

// ---------------------------------------------------------------------------
// Sketch canvas sub-component
// ---------------------------------------------------------------------------

interface SketchCanvasProps {
  initialDataUrl: string | null;
  onChange: (dataUrl: string) => void;
}

function SketchCanvas({ initialDataUrl, onChange }: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(SKETCH_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTHS[1]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [confirmClear, setConfirmClear] = useState(false);

  /** Eraser draws at 2× the pen stroke width for better usability. */
  const effectiveWidth = tool === "eraser" ? strokeWidth * 2 : strokeWidth;

  // Load initial image onto canvas after mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fafaf9"; // warm off-white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialDataUrl;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once on mount

  function getPos(
    e: PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, effectiveWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#fafaf9" : color;
    ctx.fill();
  }

  function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === "eraser" ? "#fafaf9" : color;
      ctx.lineWidth = effectiveWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    lastPos.current = pos;
  }

  function onPointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setConfirmClear(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange(canvas.toDataURL("image/png"));
  }

  function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "sketch.png";
    link.click();
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Pen / Eraser */}
        <button
          type="button"
          aria-label="Pen tool"
          aria-pressed={tool === "pen"}
          onClick={() => setTool("pen")}
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
            tool === "pen"
              ? "border-slate-700 bg-slate-800 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          ✏️ Pen
        </button>
        <button
          type="button"
          aria-label="Eraser tool"
          aria-pressed={tool === "eraser"}
          onClick={() => setTool("eraser")}
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
            tool === "eraser"
              ? "border-slate-700 bg-slate-800 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          🧹 Eraser
        </button>

        {/* Stroke width */}
        <div className="flex items-center gap-1" role="group" aria-label="Stroke width">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              aria-label={`Stroke width ${w}`}
              aria-pressed={strokeWidth === w}
              onClick={() => setStrokeWidth(w)}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                strokeWidth === w
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <span
                className={`block rounded-full ${strokeWidth === w ? "bg-white" : "bg-slate-700"}`}
                style={{ width: w + 2, height: w + 2 }}
              />
            </button>
          ))}
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-1" role="group" aria-label="Color picker">
          {SKETCH_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              aria-pressed={color === c && tool === "pen"}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              className={`h-5 w-5 rounded-full border-2 transition-transform ${
                color === c && tool === "pen"
                  ? "scale-125 border-slate-700"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Clear / Export */}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            aria-label="Export sketch as PNG"
          >
            Export PNG
          </button>
          <button
            type="button"
            onClick={handleClear}
            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
              confirmClear
                ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            aria-label={confirmClear ? "Confirm clear sketch" : "Clear sketch"}
          >
            {confirmClear ? "Tap again to clear" : "Clear"}
          </button>
        </div>
      </div>

      {confirmClear && (
        <p className="text-xs text-red-600">
          This will erase your entire sketch. Tap &ldquo;Tap again to clear&rdquo; to confirm.
        </p>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="w-full touch-none rounded-xl border border-slate-200"
        style={{ cursor: tool === "eraser" ? "cell" : "crosshair", background: "#fafaf9" }}
        aria-label="Sketch canvas"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main LessonNotebook component
// ---------------------------------------------------------------------------

export default function LessonNotebook({ lessonSlug, studentId }: Props) {
  // Lazy-initialize notebook and open state from localStorage (read-once on mount)
  const [notebook, setNotebook] = useState<LessonNotebookData>(() =>
    loadNotebook(studentId, lessonSlug),
  );
  const [open, setOpen] = useState<boolean>(() => {
    const nb = loadNotebook(studentId, lessonSlug);
    return notebookHasContent(nb);
  });
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [newObservationText, setNewObservationText] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Save helper — debounced for text, immediate for sketch/observations
  // ---------------------------------------------------------------------------

  const persist = useCallback(
    (updated: LessonNotebookData, immediate = false) => {
      setNotebook(updated);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const doSave = () => {
        saveNotebook(updated);
        setSavedAt(Date.now());
        // Clear "Saved" indicator after 2s
        setTimeout(() => setSavedAt(null), 2000);
      };
      if (immediate) {
        doSave();
      } else {
        saveTimerRef.current = setTimeout(doSave, 600);
      }
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Notes handlers
  // ---------------------------------------------------------------------------

  function handleNotesChange(text: string) {
    persist({ ...notebook, notes: text });
  }

  // ---------------------------------------------------------------------------
  // Sketch handlers
  // ---------------------------------------------------------------------------

  function handleSketchChange(dataUrl: string) {
    persist({ ...notebook, sketch: dataUrl }, true);
  }

  // ---------------------------------------------------------------------------
  // Observations handlers
  // ---------------------------------------------------------------------------

  function addObservation() {
    const text = newObservationText.trim();
    if (!text) return;
    const entry: NotebookObservation = {
      id: `obs-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      text,
    };
    persist(
      { ...notebook, observations: [...notebook.observations, entry] },
      true,
    );
    setNewObservationText("");
  }

  function removeObservation(id: string) {
    persist(
      {
        ...notebook,
        observations: notebook.observations.filter((o) => o.id !== id),
      },
      true,
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const hasContent = notebookHasContent(notebook);

  return (
    <section
      className="rounded-3xl border border-amber-100 bg-amber-50/60 p-4 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20"
      aria-label="Lab Notebook"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            📓 Lab Notebook
          </h2>
          {!open && hasContent && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              You have notes for this lesson.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="notebook-panel"
          className="rounded-xl border border-amber-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-white dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
        >
          {open ? "Close" : "Open notebook"}
        </button>
      </div>

      {/* Collapsible panel */}
      {open && (
        <div id="notebook-panel" className="mt-3 space-y-3">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl border border-amber-200 bg-white/60 p-1 dark:border-amber-800 dark:bg-amber-900/20">
            {(["notes", "sketch", "observations"] as Tab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-amber-800 text-white dark:bg-amber-700"
                    : "text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Saved indicator */}
          <div className="flex justify-end">
            <span
              className={`text-xs transition-opacity duration-500 ${
                savedAt !== null
                  ? "text-emerald-600 opacity-100 dark:text-emerald-400"
                  : "opacity-0"
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              ✓ Saved
            </span>
          </div>

          {/* Tab panels */}
          {activeTab === "notes" && (
            <div role="tabpanel" aria-label="Notes">
              <textarea
                value={notebook.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                rows={8}
                className="w-full resize-y rounded-xl border border-amber-200 bg-white/80 p-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100 dark:placeholder:text-amber-600"
                placeholder="Write anything — questions, ideas, things that don't make sense yet."
                aria-label="Lesson notes"
              />
            </div>
          )}

          {activeTab === "sketch" && (
            <div role="tabpanel" aria-label="Sketch">
              <SketchCanvas
                initialDataUrl={notebook.sketch}
                onChange={handleSketchChange}
              />
            </div>
          )}

          {activeTab === "observations" && (
            <div role="tabpanel" aria-label="Observations" className="space-y-3">
              {/* Add observation */}
              <div className="flex gap-2">
                <textarea
                  value={newObservationText}
                  onChange={(e) => setNewObservationText(e.target.value)}
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-amber-200 bg-white/80 p-2.5 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100 dark:placeholder:text-amber-600"
                  placeholder="What do you notice?"
                  aria-label="New observation text"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addObservation();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addObservation}
                  disabled={!newObservationText.trim()}
                  className="self-end rounded-xl bg-amber-800 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-900 disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                  aria-label="Add observation"
                >
                  Add
                </button>
              </div>

              {/* Observation list */}
              {notebook.observations.length === 0 ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  No observations yet. Click &ldquo;Add&rdquo; to record what you notice.
                </p>
              ) : (
                <ol className="space-y-2">
                  {notebook.observations.map((obs) => (
                    <li
                      key={obs.id}
                      className="rounded-xl border border-amber-200 bg-white/70 p-3 dark:border-amber-800 dark:bg-amber-950/30"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <time
                          dateTime={obs.timestamp}
                          className="text-xs font-semibold text-amber-700 dark:text-amber-400"
                        >
                          {new Date(obs.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {new Date(obs.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                        <button
                          type="button"
                          onClick={() => removeObservation(obs.id)}
                          className="rounded text-xs text-slate-400 hover:text-red-500"
                          aria-label="Remove observation"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm leading-6 text-slate-800 dark:text-amber-100">
                        {obs.text}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
