import Link from "next/link";
import { PageContent, Card } from "@/components/ui";

const FEATURED_PHENOMENA = [
  {
    id: "gulf-dead-zone",
    title: "Gulf Dead Zone Animation",
    href: "/phenomena-studio/gulf-dead-zone-animation-v17",
    note: "Cycle-based animation connecting nitrogen, carbon, and water in the Gulf hypoxia phenomenon.",
  },
  {
    id: "enzyme-lock-key",
    title: "Enzyme Lock-and-Key Breakdown",
    href: "/simulations/enzyme-kinetics",
    note: "Interactive model of active-site specificity and denaturation.",
  },
  {
    id: "upload-your-own",
    title: "Bring Your Own Phenomenon",
    href: "/phenomena-studio/upload-guide",
    note: "Upload an HTML phenomenon file and open it in BioSpark.",
  },
];

export default function PhenomenaStudioPage() {
  return (
    <main>
      <PageContent className="py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold tracking-tight text-bs-text">
            SparkScope Phenomena Studio
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-bs-text-sub">
            Explore story-driven biology phenomena and launch interactive
            investigations that connect classroom evidence to real-world events.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {FEATURED_PHENOMENA.map((item) => (
              <Link key={item.id} href={item.href} className="group">
                <Card
                  className="h-full rounded-3xl border border-bs-border bg-bs-surface p-5"
                  glow
                >
                  <h2 className="text-xl font-semibold text-bs-text">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-bs-text-sub">{item.note}</p>
                  <div className="mt-4 inline-flex rounded-xl border border-bs-teal/50 bg-(--bs-teal-dim) px-3 py-2 text-xs font-semibold text-bs-teal">
                    Open {"->"}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="mt-5 rounded-3xl border border-bs-border bg-bs-surface p-5">
            <div className="text-sm font-semibold text-bs-text">
              Quick Launch
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/phenomena-studio/gulf-dead-zone-animation-v17"
                className="rounded-full border border-bs-border bg-bs-raised px-4 py-2 text-xs font-semibold text-bs-text-sub hover:border-bs-teal/55 hover:text-bs-teal"
              >
                Gulf Dead Zone
              </Link>
              <Link
                href="/simulations"
                className="rounded-full border border-bs-border bg-bs-raised px-4 py-2 text-xs font-semibold text-bs-text-sub hover:border-bs-teal/55 hover:text-bs-teal"
              >
                Open Simulations
              </Link>
              <Link
                href="/phenomena-studio/upload-guide"
                className="rounded-full border border-bs-border bg-bs-raised px-4 py-2 text-xs font-semibold text-bs-text-sub hover:border-bs-teal/55 hover:text-bs-teal"
              >
                Upload Guide
              </Link>
            </div>
          </Card>
        </div>
      </PageContent>
    </main>
  );
}
