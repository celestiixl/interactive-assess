import Link from "next/link";
import { loadItemBank } from "@/lib/itemBank/load";

export const dynamic = "force-dynamic";

export default async function TeacherItemBankPage() {
  const bank = await loadItemBank();
  const items = bank?.items ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Item Bank</h1>
            <p className="mt-1 text-sm text-slate-600">
              Loaded from <code className="rounded bg-white px-1">lib/itemBank</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/teacher/builder"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Open Builder
            </Link>
            <Link
              href="/teacher/dashboard"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Items ({items.length})</div>

          {items.length === 0 ? (
            <div className="mt-3 text-sm text-slate-600">
              No items found. Check <code className="rounded bg-slate-50 px-1">apps/web/src/lib/itemBank/bank.example.json</code>{" "}
              and the loader in <code className="rounded bg-slate-50 px-1">apps/web/src/lib/itemBank/load.ts</code>.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {items.map((it: any) => (
                <div key={it.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {it.title || it.prompt?.slice?.(0, 80) || "Untitled item"}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        <span className="font-semibold">type:</span> {it.type || "unknown"}{" "}
                        {it.teks?.length ? (
                          <>
                            <span className="mx-2">•</span>
                            <span className="font-semibold">TEKS:</span> {it.teks.join(", ")}
                          </>
                        ) : null}
                      </div>
                    </div>

                    <Link
                      href="/teacher/builder"
                      className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                      title="Open builder (editing coming later)"
                    >
                      Build
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
