import Link from "next/link";
import { PageContent } from "@/components/ui";

function LinkCard({
  title,
  desc,
  href,
  badge,
  tone = "slate",
}: {
  title: string;
  desc: string;
  href: string;
  badge?: string;
  tone?: "slate" | "teal" | "amber" | "green" | "purple";
}) {
  const tones: Record<string, string> = {
    slate: "border-[var(--bs-border)] bg-white/75 backdrop-blur-sm",
    teal: "border-teal-200 bg-teal-50/40",
    amber: "border-amber-200 bg-amber-50/40",
    green: "border-green-200 bg-green-50/40",
    purple: "border-purple-200 bg-purple-50/40",
  };

  return (
    <Link
      href={href}
      className={[
        "group block rounded-3xl border p-5 shadow-sm transition hover:shadow-md",
        tones[tone],
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-bs-text">{title}</div>
            {badge ? (
              <span className="rounded-full border bg-white/70 backdrop-blur-sm px-2 py-0.5 text-xs text-bs-text-sub">
                {badge}
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-sm text-bs-text-sub">{desc}</div>
        </div>
        <div className="text-lg opacity-70 group-hover:opacity-100">→</div>
      </div>
    </Link>
  );
}

export default function StudentAssessmentLabPage() {
  return (
    <main className="ia-vh-page flex h-dvh flex-col overflow-hidden text-bs-text">
      <PageContent className="flex-1 min-h-0 py-4">
        <div className="ia-vh-scroll h-full min-h-0 overflow-y-auto pr-1">
          <div className="ia-vh-grid flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold tracking-tight">
              Assessment Lab
            </h1>
            <p className="mt-2 text-sm text-bs-text-sub">
              Quick entry points for student-facing practice and interactive
              item testing.
            </p>

            <div className="mt-4 rounded-2xl border bg-white/95 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Quick links
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <LinkCard
                  title="Open Student Dashboard"
                  desc="Mastery donut + specimens + goals."
                  href="/student/dashboard"
                  tone="teal"
                />
                <LinkCard
                  title="BioSpark Quest"
                  desc="Adaptive micro-challenges + XP + badges."
                  href="/student/learn"
                  tone="purple"
                  badge="new"
                />
                <LinkCard
                  title="My Profile"
                  desc="View your XP, streak, badges, and mastery."
                  href="/student/profile"
                  tone="teal"
                />
                <LinkCard
                  title="Practice Runner"
                  desc="Run a practice set (demo)."
                  href="/practice"
                  tone="green"
                />
                <LinkCard
                  title="Items Test Screen"
                  desc="Render items & verify checks."
                  href="/student/assessment/items"
                  tone="purple"
                />
                <LinkCard
                  title="Hot Question"
                  desc="Bellringer question (if enabled)."
                  href="/student/hotq"
                  tone="amber"
                  badge="beta"
                />
              </div>

              <div className="mt-3 text-xs text-bs-text-sub">
                Tip: Use this page as your “sandbox hub” while you build.
              </div>
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="p-4 ia-card-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-bs-text">
                    Student Assessment Lab
                  </div>
                  <div className="mt-1 text-sm text-bs-text-sub">
                    Sandbox screen to verify item rendering, pills, attempts,
                    and check behavior.
                  </div>
                  <div className="mt-3 text-xs text-bs-text-sub">
                    (We&apos;ll wire real test data next.)
                  </div>
                </div>
                <div className="text-sm text-bs-text-sub tabular-nums">v0.1</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/student/assessment/items"
                  className="rounded-2xl border bg-bs-bg px-4 py-3 text-sm font-semibold text-white hover:bg-bs-bg"
                >
                  Open Items Test →
                </Link>
                <Link
                  href="/student/dashboard"
                  className="rounded-2xl border bg-white/95 px-4 py-3 text-sm font-semibold text-bs-text hover:bg-[var(--bs-raised)]"
                >
                  Go to Dashboard →
                </Link>
                <Link
                  href="/student/learn"
                  className="rounded-2xl border bg-white/95 px-4 py-3 text-sm font-semibold text-bs-text hover:bg-[var(--bs-raised)]"
                >
                  Open BioSpark Quest →
                </Link>
                <Link
                  href="/student/profile"
                  className="rounded-2xl border bg-white/95 px-4 py-3 text-sm font-semibold text-bs-text hover:bg-[var(--bs-raised)]"
                >
                  Open My Profile →
                </Link>
              </div>
            </div>

            <div className="mt-4 p-4 ia-card-soft">
              <div className="text-sm font-semibold text-bs-text">
                What this page is for
              </div>
              <ul className="mt-3 space-y-2 text-sm text-bs-text-sub">
                <li>
                  • Validate interactive items render correctly across screens.
                </li>
                <li>
                  • Confirm attempt limits, reveal behavior, and feedback UI.
                </li>
                <li>
                  • Quickly jump between Student Dashboard and practice flows.
                </li>
                <li>• Launch adaptive challenge mode for daily skill boosts.</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </PageContent>
    </main>
  );
}
