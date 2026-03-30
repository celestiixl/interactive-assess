"use client";

import { useState } from "react";
import { loadNotebook, notebookHasContent } from "@/lib/lessonNotebook";

interface Props {
  studentId: string;
  lessonSlug: string;
  lessonTitle?: string;
}

/**
 * TeacherNotebookPeek — read-only view of a student's lab notebook for a given lesson.
 * Framed as a diagnostic tool ("view student notes"), not an assessment surface.
 * Hidden behind one extra click — collapsed by default.
 */
export default function TeacherNotebookPeek({
  studentId,
  lessonSlug,
  lessonTitle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [notes, setNotes] = useState("");
  const [sketchUrl, setSketchUrl] = useState<string | null>(null);
  const [observations, setObservations] = useState<
    { id: string; timestamp: string; text: string }[]
  >([]);

  function handleOpen() {
    if (!loaded) {
      const nb = loadNotebook(studentId, lessonSlug);
      setNotes(nb.notes);
      setSketchUrl(nb.sketch);
      setObservations(nb.observations);
      setHasContent(notebookHasContent(nb));
      setLoaded(true);
    }
    setOpen((v) => !v);
  }

  return (
    <div className="mt-2 rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-3 text-sm">
      <button
        type="button"
        onClick={handleOpen}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-xs font-semibold text-bs-text-sub hover:text-bs-text"
      >
        <span>
          📓 View student notes
          {lessonTitle ? ` — ${lessonTitle}` : ""}
        </span>
        <span className="text-bs-text-muted">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loaded && !hasContent ? (
            <p className="text-xs text-bs-text-sub italic">
              This student has no notebook entries for this lesson yet.
            </p>
          ) : null}

          {notes.trim() ? (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Notes
              </div>
              <p className="whitespace-pre-wrap rounded-lg border border-[var(--bs-border)] bg-bs-surface p-2.5 text-xs leading-5 text-bs-text-sub">
                {notes}
              </p>
            </div>
          ) : null}

          {observations.length > 0 ? (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Observations
              </div>
              <ol className="space-y-1.5">
                {observations.map((obs) => (
                  <li
                    key={obs.id}
                    className="rounded-lg border border-[var(--bs-border)] bg-bs-surface p-2.5"
                  >
                    <time
                      dateTime={obs.timestamp}
                      className="block text-xs font-semibold text-bs-text-sub"
                    >
                      {new Date(obs.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <p className="mt-0.5 text-xs leading-5 text-bs-text-sub">
                      {obs.text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {sketchUrl ? (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Sketch
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sketchUrl}
                alt="Student sketch"
                className="max-h-64 w-full rounded-lg border border-[var(--bs-border)] object-contain bg-bs-surface"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
