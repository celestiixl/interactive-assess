import Link from "next/link";
import { loadBank } from "@/lib/itemBank/load";
import ItemBankTabsClient from "./ItemBankTabsClient";
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
            className="rounded-bs border border-[var(--bs-border)] bg-bs-surface px-4 py-2 text-sm font-semibold text-bs-text shadow-sm hover:bg-[var(--bs-raised)]"
          >
            + New Item
          </Link>
          <Link
            href="/teacher/dashboard"
            className="rounded-bs bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Dashboard
          </Link>
        </div>
      </PageBanner>
      <PageContent className="py-8">
        <ItemBankTabsClient publicItems={items} />
      </PageContent>
    </main>
  );
}

