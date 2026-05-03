export function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 px-6 py-4 items-center border-b border-[#F3F4F6]">
      <div className="col-span-2">
        <div className="h-3 w-12 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-3">
        <div className="h-3 w-32 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-2">
        <div className="h-5 w-16 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-2">
        <div className="h-3 w-20 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <div className="h-8 w-8 bg-(--color-surface-highest) animate-pulse rounded" />
        <div className="h-3 w-16 bg-(--color-surface-highest) animate-pulse rounded" />
      </div>
      <div className="col-span-1" />
    </div>
  );
}

export function SkeletonMobileRow() {
  return (
    <div className="p-4 border-b border-[#F3F4F6] space-y-3">
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-gray-100 animate-pulse rounded" />
        <div className="h-5 w-16 bg-gray-100 animate-pulse rounded" />
      </div>
      <div className="h-4 w-40 bg-gray-100 animate-pulse rounded" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-100 animate-pulse rounded-full" />
        <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
      </div>
    </div>
  );
}