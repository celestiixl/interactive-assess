import { PageContent, Card } from "@/components/ui";

export default function PhenomenaUploadGuidePage() {
  return (
    <main>
      <PageContent className="py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold tracking-tight text-bs-text">
            Phenomena Upload Guide
          </h1>
          <p className="mt-2 text-sm text-bs-text-sub">
            Add your own HTML phenomenon and open it inside BioSpark.
          </p>

          <Card
            className="mt-6 rounded-3xl border border-bs-border bg-bs-surface p-5"
            glow
          >
            <div className="text-sm font-semibold text-bs-text">
              Where to upload
            </div>
            <div className="mt-3 space-y-2 text-sm text-bs-text-sub">
              <div>
                Place files in:{" "}
                <code className="font-mono text-bs-text">
                  apps/web/public/phenomena/
                </code>
              </div>
              <div>
                Example file:{" "}
                <code className="font-mono text-bs-text">
                  apps/web/public/phenomena/osmosis-lab.html
                </code>
              </div>
              <div>
                Open in app:{" "}
                <code className="font-mono text-bs-text">
                  /phenomena-studio/osmosis-lab
                </code>
              </div>
            </div>
          </Card>
        </div>
      </PageContent>
    </main>
  );
}
