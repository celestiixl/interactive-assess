import { notFound } from "next/navigation";
import { PageContent } from "@/components/ui";
import { BackLink } from "@/components/nav/BackLink";

type PhenomenonPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PhenomenonHtmlPage({
  params,
}: PhenomenonPageProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const src = `/phenomena/${encodeURIComponent(slug)}.html`;

  return (
    <main>
      <PageContent className="py-6">
        <div className="mx-auto max-w-6xl">
          <BackLink href="/phenomena-studio" label="Back to phenomena" />
          <h1 className="text-2xl font-semibold text-bs-text">
            Phenomenon: {slug}
          </h1>
          <p className="mt-1 text-sm text-bs-text-sub">
            Loaded from <span className="font-mono text-bs-text">{src}</span>
          </p>
          <div className="mt-2">
            <a
              href={src}
              download={`${slug}.html`}
              className="inline-flex rounded-xl border border-bs-border bg-bs-raised px-3 py-2 text-xs font-semibold text-bs-text-sub hover:border-bs-teal/55 hover:text-bs-teal"
            >
              Download HTML
            </a>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-bs-border bg-bs-surface">
            <iframe
              src={src}
              title={`Phenomenon ${slug}`}
              className="h-[78vh] w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </PageContent>
    </main>
  );
}
