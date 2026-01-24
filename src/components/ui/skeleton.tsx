import { twMerge } from "tailwind-merge";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        "h-4 w-full rounded-md bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200",
        "dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800",
        "animate-shimmer bg-[length:200%_100%]",
        className
      )}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={twMerge("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={twMerge(
            "h-4",
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return (
    <Skeleton className={twMerge(
      "h-10 w-10 rounded-full",
      className
    )} />
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton className={twMerge(
      "h-10 w-24 rounded-lg",
      className
    )} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={twMerge(
      "rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4",
      className
    )}>
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
      <SkeletonButton className="w-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-6" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-10" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-1/3" />
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <SkeletonAvatar />
          <div className="flex-1">
            <SkeletonText lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
}
