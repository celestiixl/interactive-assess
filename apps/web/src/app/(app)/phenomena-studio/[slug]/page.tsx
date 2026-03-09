import { notFound } from "next/navigation";
import { PageContent } from "@/components/ui";
import Link from "next/link";

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
          <Link
            href="/phenomena-studio"
            className="inline-flex text-sm font-semibold text-bs-text hover:text-bs-teal"
          >
            {"\u2190 Return to Phenomena"}
          </Link>
          <h1 className="text-2xl font-semibold text-bs-text">
            Phenomenon: {slug}
          </h1>
          <p className="mt-1 text-sm text-bs-text-sub">
            Loaded from <span className="font-mono text-bs-text">{src}</span>
          </p>

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
