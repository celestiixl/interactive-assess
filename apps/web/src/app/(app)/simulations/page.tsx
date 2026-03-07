import Link from "next/link";
import type { ReactNode } from "react";
import { PageContent, Card } from "@/components/ui";
import PopulationGeneticsPreview from "@/components/simulations/PopulationGeneticsPreview";
import EnzymeKineticsPreview from "@/components/simulations/EnzymeKineticsPreview";

type SimulationCatalogItem = {
  id: string;
  title: string;
  href: string;
  summary: string;
  preview: ReactNode;
  topic: string;
};

const SIMULATIONS: SimulationCatalogItem[] = [
  {
    id: "population-genetics",
    title: "Population Genetics",
    href: "/simulations/population-genetics",
    summary:
      "Model allele frequency change across generations using population size, random drift, and selection pressure.",
    preview: <PopulationGeneticsPreview />,
    topic: "Evolution",
  },
  {
    id: "enzyme-kinetics",
    title: "Enzyme Kinetics Lab",
    href: "/simulations/enzyme-kinetics",
    summary:
      "Investigate lock-and-key specificity, substrate matching, and denaturation effects from temperature and pH shifts.",
    preview: <EnzymeKineticsPreview />,
    topic: "Cellular Processes",
  },
];

export default function SimulationsPage() {
  return (
    <main>
      <PageContent className="py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold tracking-tight text-bs-text">
            Simulations
          </h1>
          <p className="mt-2 text-sm text-bs-text-sub">
            Explore interactive biology simulations and test ideas with live
            controls.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {SIMULATIONS.map((sim) => (
              <Link key={sim.id} href={sim.href} className="group">
                <Card
                  className="h-full rounded-3xl border border-bs-border bg-bs-surface p-5 transition hover:shadow-md"
                  glow
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-bs-info">
                    {sim.topic}
                  </div>

                  {/* Required card order: title -> preview -> explanation */}
                  <h2 className="mt-2 text-xl font-semibold text-bs-text">
                    {sim.title}
                  </h2>

                  {sim.preview}

                  <p className="mt-3 text-sm text-bs-text-sub">{sim.summary}</p>

                  <div className="mt-4 inline-flex rounded-xl border border-bs-teal/50 bg-(--bs-teal-dim) px-3 py-2 text-xs font-semibold text-bs-teal">
                    Open Simulation {"->"}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </PageContent>
    </main>
  );
}
