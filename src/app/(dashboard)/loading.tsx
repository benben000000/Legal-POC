export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading page content">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-gray-200 skeleton-shimmer" />
          <div className="h-4 w-72 rounded bg-gray-100" />
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-24 rounded bg-gray-200" />
          <div className="h-8 w-28 rounded bg-blue-100" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-lg border border-gray-200 bg-white space-y-3 shadow-xs"
          >
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-8 w-16 rounded bg-gray-300 skeleton-shimmer" />
            <div className="h-3 w-32 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Content Card / Table Skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4 shadow-xs">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="h-5 w-36 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-100" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center space-x-4 py-2 border-b border-gray-50 last:border-0">
              <div className="h-4 w-1/4 rounded bg-gray-200 skeleton-shimmer" />
              <div className="h-4 w-1/4 rounded bg-gray-100" />
              <div className="h-4 w-1/6 rounded bg-gray-100" />
              <div className="h-4 w-1/6 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-blue-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
