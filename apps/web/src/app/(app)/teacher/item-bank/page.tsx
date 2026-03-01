import Link from "next/link";
import { loadBank } from "@/lib/itemBank/load";
import ItemBankClient from "./ItemBankClient";

export const dynamic = "force-dynamic";

export default async function TeacherItemBankPage() {
  const bank = loadBank();
  const items = bank?.items ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Item Bank</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} TEKS-aligned questions ready to add to assessments.
            Select items below, then copy or send to Builder.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/teacher/builder"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            + New Item
          </Link>
          <Link
            href="/teacher/dashboard"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <ItemBankClient items={items} />
    </main>
  );
}
