"use client";

import { useEffect, useState } from "react";
import type {
  AssignmentSummary,
  StudentSummary,
} from "@/types/assignment-summary";

function ProgressBarInline({ percent }: { percent: number }) {
  const p = Math.round(percent * 100);
  return (
    <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
      <div
        className="h-2 bg-emerald-500"
        style={{ width: `${p}%` }}
        aria-hidden
      />
    </div>
  );
}

export default function AssignmentSummaryClient({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const [summary, setSummary] = useState<AssignmentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    if (!assignmentId) return;
    setLoading(true);
    fetch(`/api/assignments/${encodeURIComponent(assignmentId)}/summary`)
      .then((r) => r.json())
      .then((d) => setSummary(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  if (loading) return <div className="p-6">Loading summary…</div>;
  if (!summary) return <div className="p-6">No summary available.</div>;

  const lowSample = summary.overallStats.totalItems < 5;

  const { overallStats, itemSummaries, tagSummaries, groups } = summary;

  function copyList(students: StudentSummary[]) {
    const text = students
      .map((s) => `${s.studentId}${s.name ? ` — ${s.name}` : ""}`)
      .join("\n");
    navigator.clipboard?.writeText(text);
    alert("Copied to clipboard");
  }

  function exportCSV() {
    const rows: string[][] = [];
    rows.push(["studentId", "name", "group", "accuracy"]);
    const push = (grp: string, arr: StudentSummary[]) => {
      arr.forEach((s) =>
        rows.push([
          s.studentId,
          s.name || "",
          grp,
          (s.accuracy * 100).toFixed(1),
        ]),
      );
    };
    push("reteach", groups.reteach);
    push("practice", groups.practice);
    push("extend", groups.extend);
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${assignmentId}_groups.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      {lowSample && (
        <div className="text-yellow-700 text-sm">
          ⚠ Low sample size (fewer than 5 items); results may not be reliable.
        </div>
      )}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {overallStats.assignmentTitle ||
              `Assignment ${overallStats.assignmentId}`}
          </h1>
          <div className="text-sm text-slate-500">
            Items: {overallStats.totalItems} • Students:{" "}
            {overallStats.totalStudents}
            {overallStats.dateRange?.startDate && (
              <><span className="mx-1">•</span>{new Date(overallStats.dateRange.startDate).toLocaleDateString()} - {new Date(overallStats.dateRange.endDate||overallStats.dateRange.startDate).toLocaleDateString()}</>
            )}
          </div>
        </div>
        <div className="space-x-2">
          <button className="ia-btn" onClick={() => exportCSV()}>
            Export CSV
          </button>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-4">
        <div className="ia-card-soft p-4">
          <div className="text-sm font-medium text-slate-600">
            Overall Accuracy
          </div>
          <div className="text-xl font-semibold">
            {Math.round(overallStats.overallAccuracy * 100)}%
          </div>
          <div className="mt-2">
            <ProgressBarInline percent={overallStats.overallAccuracy} />
          </div>
        </div>

        <div className="ia-card-soft p-4">
          <div className="text-sm font-medium text-slate-600">
            Lowest Tag Accuracy
          </div>
          <div className="text-lg font-semibold text-rose-600">
            {summary.lowestTags?.[0]?.tag || "—"}
          </div>
          <div className="text-sm text-slate-500">
            {summary.lowestTags?.[0]
              ? `${Math.round(summary.lowestTags[0].accuracy * 100)}%`
              : "—"}
          </div>
        </div>

        <div className="ia-card-soft p-4">
          <div className="text-sm font-medium text-slate-600">
            Highest Tag Accuracy
          </div>
          <div className="text-lg font-semibold text-emerald-600">
            {summary.highestTags?.[0]?.tag || "—"}
          </div>
          <div className="text-sm text-slate-500">
            {summary.highestTags?.[0]
              ? `${Math.round(summary.highestTags[0].accuracy * 100)}%`
              : "—"}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Misconception Heatmap</h2>
          <div className="text-sm text-slate-500">
            Showing{" "}
            {showAllTags
              ? tagSummaries.length
              : Math.min(10, tagSummaries.length)}{" "}
            lowest tags
          </div>
        </div>

        <div className="ia-card-soft overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="text-sm text-slate-600">
              <tr>
                <th className="text-left p-3">Tag</th>
                <th className="text-left p-3">Accuracy</th>
                <th className="text-left p-3">Attempts</th>
                <th className="text-left p-3">Items</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tagSummaries
                .sort((a, b) => a.accuracy - b.accuracy)
                .slice(0, showAllTags ? undefined : 10)
                .map((t) => (
                  <tr key={t.tag} className="border-t">
                    <td className="p-3 align-top">{t.tag}</td>
                    <td className="p-3 align-top">
                      <div className="text-sm">
                        {Math.round(t.accuracy * 100)}%
                      </div>
                      <div className="mt-1">
                        <ProgressBarInline percent={t.accuracy} />
                      </div>
                    </td>
                    <td className="p-3 align-top">{t.attempts}</td>
                    <td className="p-3 align-top">{t.itemCount}</td>
                    <td className="p-3 align-top">
                      <details>
                        <summary className="text-sm text-slate-600 underline cursor-pointer">
                          View items
                        </summary>
                        <ul className="mt-2 ml-4 list-disc">
                          {t.itemIds.map((id) => {
                            const it = summary.itemSummaries.find(
                              (s) => s.itemId === id,
                            );
                            return (
                              <li key={id} className="text-sm">
                                {it?.title || id} —{" "}
                                {it ? `${Math.round(it.accuracy * 100)}%` : "—"}
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {tagSummaries.length > 10 ? (
          <div className="text-right">
            <button
              className="ia-btn text-sm"
              onClick={() => setShowAllTags((s) => !s)}
            >
              {showAllTags ? "Show less" : "Show all"}
            </button>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Item Performance</h2>
        <div className="ia-card-soft overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="text-sm text-slate-600">
              <tr>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Accuracy</th>
                <th className="text-left p-3">Attempts</th>
                <th className="text-left p-3">Tags</th>
              </tr>
            </thead>
            <tbody>
              {itemSummaries.map((it) => (
                <tr key={it.itemId} className="border-t">
                  <td className="p-3 align-top max-w-xl">{it.title}</td>
                  <td className="p-3 align-top">
                    <div>{Math.round(it.accuracy * 100)}%</div>
                    <div className="mt-1">
                      <ProgressBarInline percent={it.accuracy} />
                    </div>
                  </td>
                  <td className="p-3 align-top">{it.attempts}</td>
                  <td className="p-3 align-top">
                    {it.tags?.join(", ") || "Untagged"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Groups</h2>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="ia-card-soft p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">Reteach</div>
                <div className="text-xs text-slate-500">
                  {groups.reteach.length} students
                </div>
              </div>
              <div className="space-x-2">
                <button
                  className="ia-btn-xs"
                  onClick={() => copyList(groups.reteach)}
                >
                  Copy list
                </button>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {groups.reteach.map((s) => (
                <li key={s.studentId} className="text-sm">
                  {s.studentId}
                  {s.name ? ` — ${s.name}` : ""}{" "}
                  <span className="text-xs text-slate-500">
                    ({Math.round(s.accuracy * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ia-card-soft p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">Practice</div>
                <div className="text-xs text-slate-500">
                  {groups.practice.length} students
                </div>
              </div>
              <div className="space-x-2">
                <button
                  className="ia-btn-xs"
                  onClick={() => copyList(groups.practice)}
                >
                  Copy list
                </button>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {groups.practice.map((s) => (
                <li key={s.studentId} className="text-sm">
                  {s.studentId}
                  {s.name ? ` — ${s.name}` : ""}{" "}
                  <span className="text-xs text-slate-500">
                    ({Math.round(s.accuracy * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ia-card-soft p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">Extend</div>
                <div className="text-xs text-slate-500">
                  {groups.extend.length} students
                </div>
              </div>
              <div className="space-x-2">
                <button
                  className="ia-btn-xs"
                  onClick={() => copyList(groups.extend)}
                >
                  Copy list
                </button>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {groups.extend.map((s) => (
                <li key={s.studentId} className="text-sm">
                  {s.studentId}
                  {s.name ? ` — ${s.name}` : ""}{" "}
                  <span className="text-xs text-slate-500">
                    ({Math.round(s.accuracy * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
