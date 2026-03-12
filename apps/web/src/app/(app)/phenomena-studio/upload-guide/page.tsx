"use client";

import { useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/nav/BackLink";
import { WhatsNextRoadmap } from "@/components/roadmap/WhatsNextRoadmap";
import { PageContent, Card } from "@/components/ui";
import { useTeacherAuth } from "@/lib/teacherAuth";
import {
  approveImportedPhenomenon,
  isSiteAdminEmail,
  loadImportedPhenomena,
  rejectImportedPhenomenon,
  submitImportedPhenomenon,
} from "@/lib/phenomenaImports";
import {
  makeRoadmapId,
  type RoadmapItem,
  type RoadmapStatus,
  useRoadmapItems,
} from "@/lib/roadmap";

const PLANT_SYSTEMS_ANIMATION_TODOS = [
  "Plant Systems: add left-to-right breeze sway wave across bluebonnet field (2-3 degree stem rock)",
  "Plant Systems: add 4-6 detailed bees in lazy looping arcs over field (pollination visual)",
  "Plant Systems: add ultra-subtle cloud drift left-to-right in sky",
  "Plant Systems: add soft sun pulse heat-radiation effect",
  "Plant Systems: staggered text reveal on load (heading, italic phrase, then subheading in 0.5s total)",
  "Plant Systems: add road heat shimmer overlay for highway summer mirage",
] as const;

export default function PhenomenaUploadGuidePage() {
  const { teacher } = useTeacherAuth();
  const isAdmin = isSiteAdminEmail(teacher?.email);
  const requester = teacher?.email ?? "anonymous";

  const [htmlInput, setHtmlInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [prMessage, setPrMessage] = useState<string | null>(null);
  const [isCreatingPr, setIsCreatingPr] = useState(false);
  const [roadmapInput, setRoadmapInput] = useState("");
  const { roadmapItems, setRoadmapItems } = useRoadmapItems();
  const [, setRefreshTick] = useState(0);

  const imports = loadImportedPhenomena();
  const pending = imports.filter((entry) => entry.status === "pending");
  const approved = imports.filter((entry) => entry.status === "approved");

  function refresh() {
    setRefreshTick((n) => n + 1);
  }

  function addUpcomingRoadmapItem() {
    const title = roadmapInput.trim();
    if (!title) return;
    const next: RoadmapItem[] = [
      {
        id: makeRoadmapId(),
        title,
        status: "upcoming",
        updatedAt: new Date().toISOString(),
      },
      ...roadmapItems,
    ];
    setRoadmapItems(next);
    setRoadmapInput("");
  }

  function addPlantSystemsAnimationTodoPack() {
    const existingTitles = new Set(roadmapItems.map((item) => item.title));
    const now = new Date().toISOString();
    const additions = PLANT_SYSTEMS_ANIMATION_TODOS.filter(
      (title) => !existingTitles.has(title),
    ).map((title) => ({
      id: makeRoadmapId(),
      title,
      status: "upcoming" as const,
      updatedAt: now,
    }));

    if (additions.length === 0) return;
    setRoadmapItems([...additions, ...roadmapItems]);
  }

  function setRoadmapStatus(id: string, status: RoadmapStatus) {
    const next = roadmapItems.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
    setRoadmapItems(next);
  }

  function deleteRoadmapItem(id: string) {
    setRoadmapItems(roadmapItems.filter((item) => item.id !== id));
  }

  function onSubmitHtml() {
    setPrMessage(null);
    const result = submitImportedPhenomenon({
      html: htmlInput,
      requestedBy: requester,
      requestedByIsAdmin: isAdmin,
    });

    if (!result.ok) {
      setMessage(result.error);
      return;
    }

    setHtmlInput("");
    setMessage(
      result.item.status === "approved"
        ? "Imported and auto-approved. It is now visible in Phenomena Explorer."
        : "Submitted for approval. A site admin must approve before it appears in Phenomena Explorer.",
    );
    refresh();
  }

  async function onCreatePullRequest() {
    setPrMessage(null);
    if (!htmlInput.trim()) {
      setPrMessage("Paste HTML first, then create a PR.");
      return;
    }

    setIsCreatingPr(true);
    try {
      const res = await fetch("/api/phenomena/import-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: htmlInput,
          requestedBy: requester,
          requestedByIsAdmin: isAdmin,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        prUrl?: string;
        prNumber?: number;
        error?: string;
        detail?: string;
      };

      if (!res.ok || !data.ok) {
        setPrMessage(
          `PR creation failed: ${data.error ?? "unknown error"}${data.detail ? ` (${data.detail})` : ""}`,
        );
        return;
      }

      setPrMessage(
        data.prUrl
          ? `PR created: ${data.prUrl}`
          : `PR #${data.prNumber ?? "?"} created successfully.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "request failed";
      setPrMessage(`PR creation failed: ${msg}`);
    } finally {
      setIsCreatingPr(false);
    }
  }

  function onApprove(id: string) {
    if (!teacher?.email) return;
    approveImportedPhenomenon(id, teacher.email);
    refresh();
  }

  function onReject(id: string) {
    rejectImportedPhenomenon(id);
    refresh();
  }

  return (
    <main>
      <PageContent className="py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold tracking-tight text-bs-text">
            Phenomena Import Console
          </h1>
          <p className="mt-2 text-sm text-bs-text-sub">
            Paste full HTML, submit to BioSpark, and publish with admin
            approval.
          </p>

          <Card
            className="mt-6 rounded-3xl border border-bs-border bg-bs-surface p-5"
            glow
          >
            <div className="text-sm font-semibold text-bs-text">Paste HTML</div>
            <p className="mt-2 text-sm text-bs-text-sub">
              Accepts full documents starting with &lt;!doctype html&gt; or
              &lt;html&gt;.
            </p>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste your full HTML phenomenon here..."
              className="mt-3 min-h-65 w-full rounded-2xl border border-bs-border bg-bs-raised p-4 font-mono text-xs text-bs-text"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSubmitHtml}
                className="rounded-xl border border-bs-teal/55 bg-(--bs-teal-dim) px-4 py-2 text-xs font-semibold text-bs-teal"
              >
                Submit Import
              </button>
              <button
                type="button"
                onClick={onCreatePullRequest}
                disabled={isCreatingPr}
                className="rounded-xl border border-blue-400/60 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 disabled:opacity-50"
              >
                {isCreatingPr ? "Creating PR..." : "Create GitHub PR"}
              </button>
              <BackLink href="/phenomena-studio" label="Back to explorer" />
              <span className="text-xs text-bs-text-sub">
                Requester: {requester}{" "}
                {isAdmin ? "(site admin)" : "(non-admin)"}
              </span>
            </div>

            {message ? (
              <div className="mt-3 rounded-xl border border-bs-border bg-bs-raised px-3 py-2 text-xs text-bs-text-sub">
                {message}
              </div>
            ) : null}
            {prMessage ? (
              <div className="mt-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
                {prMessage}
              </div>
            ) : null}
            <p className="mt-2 text-[11px] text-bs-text-sub">
              PR route env required: GITHUB_TOKEN (optional overrides:
              GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_BASE_BRANCH).
            </p>
          </Card>

          <Card
            className="mt-4 rounded-3xl border border-bs-border bg-bs-surface p-5"
            glow
          >
            <div className="text-sm font-semibold text-bs-text">
              Assessment Roadmap
            </div>
            <p className="mt-1 text-xs text-bs-text-sub">
              This writes into the same roadmap used on /assessment. Add your
              phenomenon animation TODOs there instead of maintaining a second
              roadmap.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={roadmapInput}
                onChange={(e) => setRoadmapInput(e.target.value)}
                placeholder="Add roadmap item..."
                className="w-full max-w-xl rounded-xl border border-bs-border bg-bs-raised px-3 py-2 text-xs text-bs-text"
              />
              <button
                type="button"
                onClick={addUpcomingRoadmapItem}
                className="rounded-xl border border-bs-teal/55 bg-(--bs-teal-dim) px-4 py-2 text-xs font-semibold text-bs-teal"
              >
                Add Upcoming
              </button>
              <button
                type="button"
                onClick={addPlantSystemsAnimationTodoPack}
                className="rounded-xl border border-blue-400/55 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200"
              >
                Add Plant Systems Animation TODO
              </button>
            </div>

            <div className="mt-4">
              <WhatsNextRoadmap items={roadmapItems} />
            </div>

            <div className="mt-4 rounded-2xl border border-bs-border bg-bs-raised p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Manage roadmap items
              </div>
              <div className="mt-2 space-y-2">
                {roadmapItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-bs-border bg-bs-surface px-3 py-2"
                  >
                    <div className="text-xs font-semibold text-bs-text">
                      {item.title}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setRoadmapStatus(item.id, "shipped")}
                        className="rounded-md border border-emerald-300/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-200"
                      >
                        Live now
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoadmapStatus(item.id, "in-progress")}
                        className="rounded-md border border-teal-300/40 bg-teal-500/10 px-2 py-1 text-[10px] font-semibold text-teal-200"
                      >
                        Next sprint
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoadmapStatus(item.id, "upcoming")}
                        className="rounded-md border border-amber-300/40 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-200"
                      >
                        Upcoming
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRoadmapItem(item.id)}
                        className="rounded-md border border-rose-400/40 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card
            className="mt-4 rounded-3xl border border-bs-border bg-bs-surface p-5"
            glow
          >
            <div className="text-sm font-semibold text-bs-text">
              Approval Queue
            </div>
            <p className="mt-1 text-xs text-bs-text-sub">
              Non-admin submissions stay pending until approved by a site admin.
            </p>
            <div className="mt-3 space-y-2">
              {pending.length === 0 ? (
                <div className="text-xs text-bs-text-sub">
                  No pending imports.
                </div>
              ) : (
                pending.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-bs-border bg-bs-raised px-3 py-3"
                  >
                    <div className="text-sm font-semibold text-bs-text">
                      {entry.title}
                    </div>
                    <div className="mt-1 text-xs text-bs-text-sub">
                      slug: {entry.slug} · by {entry.requestedBy}
                    </div>
                    {isAdmin ? (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onApprove(entry.id)}
                          className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(entry.id)}
                          className="rounded-lg border border-rose-400/50 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-amber-300">
                        Awaiting site-admin approval.
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card
            className="mt-4 rounded-3xl border border-bs-border bg-bs-surface p-5"
            glow
          >
            <div className="text-sm font-semibold text-bs-text">
              Approved Imports
            </div>
            <div className="mt-3 space-y-2">
              {approved.length === 0 ? (
                <div className="text-xs text-bs-text-sub">
                  No approved imports yet.
                </div>
              ) : (
                approved.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-bs-border bg-bs-raised px-3 py-3"
                  >
                    <div className="text-sm font-semibold text-bs-text">
                      {entry.title}
                    </div>
                    <div className="mt-1 text-xs text-bs-text-sub">
                      slug: {entry.slug} · approved by{" "}
                      {entry.approvedBy ?? "admin"}
                    </div>
                    <Link
                      href={`/phenomena-studio/imported/${entry.slug}`}
                      className="mt-2 inline-flex rounded-lg border border-bs-teal/55 bg-(--bs-teal-dim) px-3 py-1 text-xs font-semibold text-bs-teal"
                    >
                      Open Imported Phenomenon
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </PageContent>
    </main>
  );
}
