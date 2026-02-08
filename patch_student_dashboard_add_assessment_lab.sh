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
echo "✅ APP_ROOT=$APP_ROOT"

DASH_PAGE="$APP_ROOT/student/dashboard/page.tsx"
if [ ! -f "$DASH_PAGE" ]; then
  echo "❌ student dashboard page not found at: $DASH_PAGE"
  echo "   Check: ls -la $APP_ROOT/student/dashboard"
  exit 1
fi
echo "✅ DASH_PAGE=$DASH_PAGE"

DEFAULT_RC='RC1 • Cell Structure & Function'

# Create hub routes
LAB_DIR="$APP_ROOT/student/assessment"
LAB_ITEMS_DIR="$APP_ROOT/student/assessment/items"
mkdir -p "$LAB_DIR" "$LAB_ITEMS_DIR"

cat > "$LAB_DIR/page.tsx" <<EOT
import Link from "next/link";

const DEFAULT_RC = ${DEFAULT_RC@Q};

export default function StudentAssessmentLab() {
  const rc = encodeURIComponent(DEFAULT_RC);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assessment Lab</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quick entry points for student-facing practice and interactive item testing.
          </p>
        </div>

        <Link
          href="/student/dashboard"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href={\`/practice?rc=\${rc}\`}
          className="group rounded-2xl border p-5 shadow-sm transition hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Demo Practice Runner</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Opens the student practice runner with a safe default reporting category.
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Default RC: <span className="font-medium text-foreground">{DEFAULT_RC}</span>
              </div>
            </div>
            <div className="text-lg opacity-70 group-hover:opacity-100">→</div>
          </div>
        </Link>

        <Link
          href="/student/assessment/items"
          className="group rounded-2xl border p-5 shadow-sm transition hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Interactive Items Test Screen</div>
              <div className="mt-1 text-sm text-muted-foreground">
                A sandbox screen to verify item rendering, spacing, pills, and check behavior.
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                (We’ll wire real test data next.)
              </div>
            </div>
            <div className="text-lg opacity-70 group-hover:opacity-100">→</div>
          </div>
        </Link>
      </div>
    </main>
  );
}
EOT

cat > "$LAB_ITEMS_DIR/page.tsx" <<'EOT'
import Link from "next/link";

export default function InteractiveItemsTestScreen() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interactive Items Test Screen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a placeholder sandbox. Next patch will render a small “demo item set”
            (including Inline Choice) so you can test pills, attempts, explanations, and check UI.
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

      <div className="mt-8 rounded-2xl border p-5">
        <div className="text-sm font-medium">Next up</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          <li>Render a fixed demo bank of item types (MC, drag, hotspot, Inline Choice)</li>
          <li>Show item-type pills + check button behavior</li>
          <li>Toggle learn/test modes and attempt limits</li>
        </ul>
      </div>
    </main>
  );
}
EOT

echo "✅ Created routes:"
echo "   - /student/assessment"
echo "   - /student/assessment/items"

# Patch Student Dashboard: add button linking to /student/assessment
ts="$(date +%Y%m%d_%H%M%S)"
cp -v "$DASH_PAGE" "$DASH_PAGE.bak.$ts" >/dev/null
echo "✅ backup: $DASH_PAGE.bak.$ts"

# Ensure Link import exists (server component safe)
perl -0777 -i -pe '
  if ($_ !~ /from\s+"next\/link"/) {
    # Insert after react/next imports if possible; otherwise at top
    if ($_ =~ s/(^(\s*import[^\n]*\n)+)/$1import Link from "next\/link";\n/s) {
      # ok
    } else {
      $_ = "import Link from \"next\/link\";\n" . $_;
    }
  }
' "$DASH_PAGE"

# Insert the new button somewhere reasonable:
# - If there is a button/action grid, drop it after the first <div className=...> block that looks like actions.
# - Otherwise, add a simple top action bar just inside the first <main ...>.

perl -0777 -i -pe '
  my $btn = q{
      <Link
        href="/student/assessment"
        className="rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted"
      >
        Assessment Lab
      </Link>
};

  # Don’t insert twice
  if ($_ =~ /href="\/student\/assessment"/) { return $_; }

  # Heuristic 1: insert into an existing actions row (look for a div with flex + gap and at least one Link)
  if ($_ =~ s/(<div[^>]*className="[^"]*(?:flex)[^"]*(?:gap)[^"]*"[^>]*>\s*(?:\s*<[^>]+>\s*){0,4})/$1$btn/s) {
    return $_;
  }

  # Heuristic 2: insert right after opening <main ...>
  if ($_ =~ s/(<main[^>]*>\s*)/$1<div className="mb-6 flex flex-wrap items-center gap-3">\n$btn\n</div>\n/s) {
    return $_;
  }

  # Fallback: prepend near top of file inside first return (
  $_ =~ s/(return\s*\(\s*)/$1<div className="mb-6 flex flex-wrap items-center gap-3">\n$btn\n</div>\n/s;

  $_;
' "$DASH_PAGE"

echo "✅ Patched Student Dashboard with new button: Assessment Lab → /student/assessment"
echo "👉 Go to /student/dashboard and click Assessment Lab"
