#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found at /workspaces/interactive-assess"; exit 1; }

# Find Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router at apps/web/src/app or apps/web/app"
  exit 1
fi

ASSESS_PAGE="$APP_ROOT/assessment/page.tsx"
mkdir -p "$(dirname "$ASSESS_PAGE")"

ts="$(date +%Y%m%d_%H%M%S)"
if [ -f "$ASSESS_PAGE" ]; then
  cp -v "$ASSESS_PAGE" "$ASSESS_PAGE.bak.$ts" >/dev/null
  echo "✅ backup: $ASSESS_PAGE.bak.$ts"
fi

cat > "$ASSESS_PAGE" <<'EOT'
import Link from "next/link";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
  );
}

function CardLink({
  href,
  title,
  desc,
  chips,
  badge,
}: {
  href: string;
  title: string;
  desc: string;
  chips: string[];
  badge: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border bg-background/60 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* subtle corner glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/15" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground">
              {badge}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </div>

        <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-muted/30 text-base text-muted-foreground transition group-hover:bg-muted/50 group-hover:text-foreground">
          →
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </div>
    </Link>
  );
}

export default function AssessmentHome() {
  return (
    <main className="relative min-h-[calc(100vh-0px)]">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.12),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(2,6,23,1)_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Chip>STAAR Biology aligned</Chip>
              <Chip>Interactive items</Chip>
              <Chip>Practice + Test modes</Chip>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Assessment
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Pick a view to continue. Student is the practice + item sandbox. Teacher is building, managing, and analytics.
              (Next upgrade: auto-route based on login + role.)
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CardLink
              href="/student/assessment"
              badge="Student"
              title="Continue as Student"
              desc="Jump into practice runner, interactive item testing, goals, and progress."
              chips={["Practice runner", "Item sandbox", "Goals", "Mastery"]}
            />
            <CardLink
              href="/teacher/dashboard"
              badge="Teacher"
              title="Continue as Teacher"
              desc="Build items, manage assessments, view analytics, and jump into student view."
              chips={["Teacher dashboard", "Builder", "Analytics", "Student view"]}
            />
          </div>

          <div className="rounded-2xl border bg-background/60 p-5 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-medium">Quick links</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Handy jumps while you’re building and testing.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/practice"
                  className="rounded-xl border bg-muted/30 px-4 py-2 text-sm font-medium transition hover:bg-muted/50"
                >
                  Practice Runner
                </Link>
                <Link
                  href="/student/assessment/items"
                  className="rounded-xl border bg-muted/30 px-4 py-2 text-sm font-medium transition hover:bg-muted/50"
                >
                  Items Test Screen
                </Link>
                <Link
                  href="/teacher/dashboard"
                  className="rounded-xl border bg-muted/30 px-4 py-2 text-sm font-medium transition hover:bg-muted/50"
                >
                  Teacher Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            Tip: once we add auth, this page becomes the smart gate that routes by role automatically.
          </div>
        </div>
      </div>
    </main>
  );
}
EOT

echo "✅ Updated /assessment UI at: $ASSESS_PAGE"
echo "👉 Refresh /assessment"
