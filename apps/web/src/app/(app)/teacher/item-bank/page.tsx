import Link from "next/link";
import { loadBank } from "@/lib/itemBank/load";
import ItemBankClient from "./ItemBankClient";
import { PageContent, PageBanner } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TeacherItemBankPage() {
  const bank = loadBank();
  const items = bank?.items ?? [];

  return (
    <main>
      <PageBanner
        title="Item Bank"
        subtitle={`${items.length} TEKS-aligned questions ready to add to assessments.`}
      >
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
      </PageBanner>
      <PageContent className="py-8">
        <ItemBankClient items={items} />
      </PageContent>
    </main>
  );
}
