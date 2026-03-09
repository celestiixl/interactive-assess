import Link from "next/link";
import { PageContent, Card } from "@/components/ui";

const FEATURED_PHENOMENA = [
  {
    id: "gulf-dead-zone-animation-v17",
    title: "Gulf Dead Zone Animation",
    href: "/phenomena-studio/gulf-dead-zone-animation-v17",
    note: "Cycle-based animation connecting nitrogen, carbon, and water in the Gulf hypoxia phenomenon.",
    previewSrc: "/phenomena-preview-gulf-dead-zone.svg",
    topic: "Ecosystems",
    unit: "Unit 6",
    tags: ["hypoxia", "water cycle", "biogeochemical cycles"],
  },
  {
    id: "upload-your-own",
    title: "Bring Your Own Phenomenon",
    href: "/phenomena-studio/upload-guide",
    note: "Upload an HTML phenomenon file and open it in BioSpark.",
    previewSrc: "/phenomena-preview-upload-guide.svg",
    topic: "Authoring",
    unit: "Toolkit",
    tags: ["custom", "html", "import"],
  },
];

type PhenomenaStudioPageProps = {
  searchParams?: {
    phenomenon?: string;
    topic?: string;
    unit?: string;
  };
};

export default function PhenomenaStudioPage({
  searchParams,
}: PhenomenaStudioPageProps) {
  const phenomenonFilter = searchParams?.phenomenon ?? "all";
  const topicFilter = searchParams?.topic ?? "all";
  const unitFilter = searchParams?.unit ?? "all";

  const topics = Array.from(
    new Set(FEATURED_PHENOMENA.map((item) => item.topic)),
  );
  const units = Array.from(
    new Set(FEATURED_PHENOMENA.map((item) => item.unit)),
  );

  const filteredPhenomena = FEATURED_PHENOMENA.filter((item) => {
    if (phenomenonFilter !== "all" && item.id !== phenomenonFilter)
      return false;
    if (topicFilter !== "all" && item.topic !== topicFilter) return false;
    if (unitFilter !== "all" && item.unit !== unitFilter) return false;
    return true;
  });

  return (
    <main>
      <PageContent className="py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-semibold tracking-tight text-bs-text">
            Phenomena Explorer
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-bs-text-sub">
            Explore story-driven biology phenomena and launch interactive
            investigations that connect classroom evidence to real-world events.
          </p>

          <Card className="mt-5 rounded-3xl border border-bs-border bg-bs-surface p-5">
            <div className="text-sm font-semibold text-bs-text">
              Filter Phenomena
            </div>
            <form
              className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4"
              method="get"
            >
              <label
                className="text-xs font-semibold text-bs-text-sub"
                htmlFor="phenomenon"
              >
                Phenomenon
                <select
                  id="phenomenon"
                  name="phenomenon"
                  defaultValue={phenomenonFilter}
                  className="mt-1 w-full rounded-xl border border-bs-border bg-bs-raised px-3 py-2 text-sm text-bs-text"
                >
                  <option value="all">All</option>
                  {FEATURED_PHENOMENA.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className="text-xs font-semibold text-bs-text-sub"
                htmlFor="topic"
              >
                Topic
                <select
                  id="topic"
                  name="topic"
                  defaultValue={topicFilter}
                  className="mt-1 w-full rounded-xl border border-bs-border bg-bs-raised px-3 py-2 text-sm text-bs-text"
                >
                  <option value="all">All</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className="text-xs font-semibold text-bs-text-sub"
                htmlFor="unit"
              >
                Unit
                <select
                  id="unit"
                  name="unit"
                  defaultValue={unitFilter}
                  className="mt-1 w-full rounded-xl border border-bs-border bg-bs-raised px-3 py-2 text-sm text-bs-text"
                >
                  <option value="all">All</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="rounded-xl border border-bs-teal/55 bg-(--bs-teal-dim) px-4 py-2 text-xs font-semibold text-bs-teal"
                >
                  Apply
                </button>
                <Link
                  href="/phenomena-studio"
                  className="rounded-xl border border-bs-border bg-bs-raised px-4 py-2 text-xs font-semibold text-bs-text-sub hover:border-bs-teal/55 hover:text-bs-teal"
                >
                  Reset
                </Link>
              </div>
            </form>
          </Card>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredPhenomena.map((item) => (
              <Link key={item.id} href={item.href} className="group">
                <Card
                  className="h-full rounded-3xl border border-bs-border bg-bs-surface p-4"
                  glow
                >
                  <div className="overflow-hidden rounded-2xl border border-bs-border bg-bs-bg">
                    <img
                      src={item.previewSrc}
                      alt={`${item.title} preview`}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-bs-text">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-bs-text-sub">{item.note}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-bs-border bg-bs-raised px-2.5 py-1 text-[11px] font-semibold text-bs-text-sub">
                      Topic: {item.topic}
                    </span>
                    <span className="rounded-full border border-bs-border bg-bs-raised px-2.5 py-1 text-[11px] font-semibold text-bs-text-sub">
                      {item.unit}
                    </span>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-bs-teal/45 bg-(--bs-teal-dim) px-2.5 py-1 text-[11px] font-semibold text-bs-teal"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 inline-flex rounded-xl border border-bs-teal/50 bg-(--bs-teal-dim) px-3 py-2 text-xs font-semibold text-bs-teal">
                    Open {"->"}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filteredPhenomena.length === 0 ? (
            <Card className="mt-4 rounded-3xl border border-bs-border bg-bs-surface p-5 text-sm text-bs-text-sub">
              No phenomena match the current filters.
            </Card>
          ) : null}

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
