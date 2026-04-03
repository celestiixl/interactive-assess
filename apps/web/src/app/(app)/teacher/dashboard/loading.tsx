import { PageContent, Card } from "@/components/ui";
import Skeleton from "@/components/ui/Skeleton";

export default function TeacherDashboardLoading() {
  return (
    <main>
      <PageContent className="py-8">
        <div className="flex flex-col gap-6">
          {/* Header skeleton */}
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-80" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-28 rounded-bs" />
              <Skeleton className="h-10 w-24 rounded-bs" />
            </div>
          </header>

          {/* KPIs skeleton */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </section>

          {/* Main content skeleton */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-24 rounded-bs" />
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </Card>

            <div className="grid gap-6">
              <Card className="p-5">
                <Skeleton className="h-7 w-36 mb-4" />
                <div className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </Card>

              <div className="rounded-2xl bg-emerald-700 p-5">
                <Skeleton className="h-7 w-48 bg-bs-surface/30 mb-2" />
                <Skeleton className="h-4 w-64 bg-bs-surface/20 mb-4" />
                <Skeleton className="h-9 w-32 rounded-bs bg-bs-surface/20" />
              </div>
            </div>
          </section>
        </div>
      </PageContent>
    </main>
  );
}
