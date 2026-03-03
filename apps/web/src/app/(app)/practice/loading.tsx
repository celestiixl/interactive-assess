import Skeleton from "@/components/ui/Skeleton";

export default function PracticeLoading() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Nav skeleton */}
      <div className="border-b bg-white px-4 py-3 flex items-center gap-3">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      {/* Progress bar skeleton */}
      <Skeleton className="h-2 w-full rounded-none" />

      {/* Main practice area skeleton */}
      <div className="flex flex-1 gap-0">
        {/* Item panel */}
        <div className="flex flex-1 flex-col gap-6 p-8">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />

          {/* Answer choices skeleton */}
          <div className="mt-4 flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>

          {/* Check button skeleton */}
          <div className="mt-4 flex justify-end">
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
