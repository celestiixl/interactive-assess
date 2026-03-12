"use client";

import { useMemo, useState } from "react";
import { Button, Card, PageContent } from "@/components/ui";
import { BackLink } from "@/components/nav/BackLink";

type Point = {
  generation: number;
  pA: number;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function runSimulation(
  generations: number,
  initialPA: number,
  populationSize: number,
  selectionStrength: number,
) {
  const points: Point[] = [{ generation: 0, pA: initialPA }];
  let pA = initialPA;

  for (let g = 1; g <= generations; g += 1) {
    // Selection pushes allele A up (positive) or down (negative).
    const selected = clamp01(pA + selectionStrength * pA * (1 - pA));

    // Drift term scales down as population size increases.
    const driftScale = 1 / Math.sqrt(Math.max(10, populationSize));
    const driftNoise = (Math.random() * 2 - 1) * driftScale;

    pA = clamp01(selected + driftNoise);
    points.push({ generation: g, pA });
  }

  return points;
}

export default function PopulationGeneticsSimulationPage() {
  const [populationSize, setPopulationSize] = useState(120);
  const [initialPA, setInitialPA] = useState(0.5);
  const [selectionStrength, setSelectionStrength] = useState(0.1);
  const [generations, setGenerations] = useState(30);
  const [seed, setSeed] = useState(0);

  const points = useMemo(
    () =>
      runSimulation(generations, initialPA, populationSize, selectionStrength),
    [generations, initialPA, populationSize, selectionStrength, seed],
  );

  const latest = points[points.length - 1];

  return (
    <main>
      <PageContent className="py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-bs-text">
                Population Genetics Simulation
              </h1>
              <p className="mt-2 text-sm text-bs-text-sub">
                Explore how allele frequency changes over time with drift and
                selection.
              </p>
            </div>

            <BackLink href="/simulations" label="Back to simulations" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="rounded-3xl border border-bs-border p-5 lg:col-span-1">
              <div className="text-sm font-semibold text-bs-text">Controls</div>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-muted">
                    Population Size: {populationSize}
                  </div>
                  <input
                    aria-label="Population size"
                    type="range"
                    min={30}
                    max={1000}
                    step={10}
                    value={populationSize}
                    onChange={(e) => setPopulationSize(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-muted">
                    Initial Allele A (p): {initialPA.toFixed(2)}
                  </div>
                  <input
                    aria-label="Initial allele frequency"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={initialPA}
                    onChange={(e) => setInitialPA(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-muted">
                    Selection Strength: {selectionStrength.toFixed(2)}
                  </div>
                  <input
                    aria-label="Selection strength"
                    type="range"
                    min={-0.4}
                    max={0.4}
                    step={0.01}
                    value={selectionStrength}
                    onChange={(e) =>
                      setSelectionStrength(Number(e.target.value))
                    }
                    className="mt-2 w-full"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-muted">
                    Generations: {generations}
                  </div>
                  <input
                    aria-label="Number of generations"
                    type="range"
                    min={5}
                    max={100}
                    step={1}
                    value={generations}
                    onChange={(e) => setGenerations(Number(e.target.value))}
                    className="mt-2 w-full"
                  />
                </label>
              </div>

              <div className="mt-5">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setSeed((s) => s + 1)}
                >
                  Rerun Simulation
                </Button>
              </div>
            </Card>

            <Card
              className="rounded-3xl border border-bs-border p-5 lg:col-span-2"
              glow
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-bs-text">
                    Allele Frequency Over Time
                  </div>
                  <div className="mt-1 text-xs text-bs-text-sub">
                    p(A) final: {latest.pA.toFixed(3)} | q(a) final:{" "}
                    {(1 - latest.pA).toFixed(3)}
                  </div>
                </div>
              </div>

              <div className="mt-4 max-h-96 overflow-y-auto rounded-2xl border border-bs-border">
                <table className="min-w-full divide-y divide-bs-border text-sm">
                  <thead className="bg-bs-raised">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-bs-text-sub">
                        Generation
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-bs-text-sub">
                        p(A)
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-bs-text-sub">
                        q(a)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bs-border-soft bg-bs-surface">
                    {points.map((point) => (
                      <tr key={point.generation}>
                        <td className="px-3 py-2 text-bs-text-sub">
                          {point.generation}
                        </td>
                        <td className="px-3 py-2 font-mono text-bs-text">
                          {point.pA.toFixed(3)}
                        </td>
                        <td className="px-3 py-2 font-mono text-bs-text">
                          {(1 - point.pA).toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </PageContent>
    </main>
  );
}
