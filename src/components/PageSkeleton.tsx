export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1180px] animate-pulse px-4 py-6 md:px-8">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton mt-3 h-4 w-72" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[2/3] w-full" />
            <div className="skeleton mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RailSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[124px] shrink-0 md:w-[150px]">
          <div className="skeleton aspect-[2/3] w-full" />
          <div className="skeleton mt-2 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}
