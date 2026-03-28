import Link from "next/link";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import { BackLink } from "@/components/nav/BackLink";
import ThemeToggle from "@/components/ia/ThemeToggle";
import PlantSystemsB12BPhenomenon from "@/components/student/PlantSystemsB12BPhenomenon";

export default function PlantSystemsB12BPhenomenonPage() {
  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-bs-text sm:px-4 sm:py-4">
      <BackLink href="/student/learn/unit-7" label="Back to unit" />
      <div className="mx-auto grid w-full max-w-6xl gap-3">
        <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Unit 7 • Processes in Plants
              </div>
              <h1 className="mt-1 text-2xl font-bold text-bs-text">
                Plant Systems B.12B Phenomenon
              </h1>
              <p className="mt-2 text-sm text-bs-text-sub">
                Analyze how plant structures facilitate interactions among
                transport, reproduction, and response systems.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-1 text-xs font-semibold text-bs-text-sub">
                TEKS B.12B
              </span>
            </div>
          </div>
        </section>

        <PlantSystemsB12BPhenomenon />

        <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
          <div className="text-sm text-bs-text-sub">
            Next step: Complete the standalone Unit 7 lesson and use your
            observations to explain how disruptions in one system affect the
            others.
          </div>
          <div className="mt-3">
            <Link
              href="/student/learn/unit-7/plant-systems-b12b"
              className="inline-flex rounded-xl bg-bs-bg px-3 py-2 text-xs font-semibold text-white hover:bg-bs-bg"
            >
              Continue to Lesson →
            </Link>
          </div>
        </section>
      </div>

      <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
