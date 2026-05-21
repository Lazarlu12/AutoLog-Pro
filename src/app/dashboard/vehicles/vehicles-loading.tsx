// src/app/dashboard/vehicles/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function VehiclesLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Grid de vehículos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            {/* Imagen placeholder */}
            <Skeleton className="h-36 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}