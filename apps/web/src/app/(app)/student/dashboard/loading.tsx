import { PageContent, Card } from "@/components/ui";
import Skeleton from "@/components/ui/Skeleton";

export default function StudentDashboardLoading() {
  return (
    <main className="min-h-dvh text-bs-text">
      {/* Header band skeleton */}
      <div className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-64 bg-white/30" />
              <Skeleton className="h-5 w-48 bg-white/20" />
            </div>
            <Skeleton className="h-11 w-44 rounded-2xl bg-white/30" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <PageContent className="-mt-5 pb-10">
        <Card>
          {/* Biome banner skeleton */}
          <Skeleton className="mb-5 h-28 w-full rounded-2xl" />

          {/* Tabs skeleton */}
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>

          {/* Donut skeleton */}
          <div className="flex flex-col items-center gap-4 rounded-2xl border p-6">
            <Skeleton className="h-64 w-64 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Bottom cards skeleton */}
          <section className="mt-5 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border bg-bs-surface p-5 shadow-sm flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </section>
        </Card>
      </PageContent>
    </main>
  );
}
