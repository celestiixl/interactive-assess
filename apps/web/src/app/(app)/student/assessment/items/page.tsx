import Link from "next/link";
import { PageContent, Card } from "@/components/ui";

export default function InteractiveItemsTestScreen() {
  return (
    <main>
      <PageContent className="py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Interactive Items Test Screen
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Placeholder sandbox. Next patch will render a small demo set
              (including Inline Choice).
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/student/assessment"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
            >
              Back to Lab
            </Link>
            <Link
              href="/practice"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
            >
              Practice
            </Link>
          </div>
        </div>

        <Card className="mt-8 p-5">
          <div className="text-sm font-medium">Next up</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            <li>Render demo item types (MC, drag, hotspot, Inline Choice)</li>
            <li>Verify item-type pills + check button behavior</li>
            <li>Toggle learn/test modes and attempt limits</li>
          </ul>
        </Card>
      </PageContent>
    </main>
  );
}
