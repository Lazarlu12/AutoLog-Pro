"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function VehicleFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleSort(sortValue: string) {
    const params = new URLSearchParams(searchParams);
    if (sortValue) {
      params.set("sort", sortValue);
    } else {
      params.delete("sort");
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-6">
      <div className="relative flex-1 sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por marca, modelo o patente..."
          className="pl-9 bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-700"
          defaultValue={searchParams.get("q")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <select
        defaultValue={searchParams.get("sort")?.toString() || "newest"}
        onChange={(e) => handleSort(e.target.value)}
        className="h-10 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700 cursor-pointer"
      >
        <option value="newest">Más recientes</option>
        <option value="mileage-desc">Mayor kilometraje</option>
        <option value="mileage-asc">Menor kilometraje</option>
        <option value="year-desc">Año (Más nuevo)</option>
        <option value="year-asc">Año (Más viejo)</option>
      </select>
    </div>
  );
}