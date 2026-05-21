import Link from "next/link";
import { getVehiclesByUser } from "@/actions/vehicles";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VehicleFilters } from "@/components/dashboard/VehicleFilters";
import {
  Car,
  Plus,
  Gauge,
  ChevronRight,
  Calendar,
  Hash,
} from "lucide-react";
import type { Metadata } from "next";
import type { SerializableVehicle } from "@/types/domain";

export const metadata: Metadata = { title: "Mis Vehículos" };

function formatMileage(km: number): string {
  return km.toLocaleString("es-AR") + " km";
}

function VehicleCard({ vehicle }: { vehicle: SerializableVehicle }) {
  return (
    <Link href={`/dashboard/vehicles/${vehicle.id}`}>
      <Card className="bg-card border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-200 group cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col gap-4 h-full">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Car className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors mt-1" />
          </div>

          {/* Nombre e info */}
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground leading-tight">
              {vehicle.nickname}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {vehicle.brand} {vehicle.model} · {vehicle.year}
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-border/40">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="w-3.5 h-3.5" />
              {formatMileage(vehicle.currentMileage)}
            </span>
            {vehicle.licensePlate && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hash className="w-3.5 h-3.5" />
                {vehicle.licensePlate.toUpperCase()}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(vehicle.createdAt).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}
            </span>
          </div>

        </CardContent>
      </Card>
    </Link>
  );
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.toLowerCase() || "";
  const sort = resolvedParams.sort || "newest";

  const result = await getVehiclesByUser();
  let vehicles: SerializableVehicle[] = result.success ? result.data : [];

  // Filtrado reactivo en el servidor
  if (query) {
    vehicles = vehicles.filter(
      (v) =>
        v.brand.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.nickname?.toLowerCase().includes(query) ||
        v.licensePlate?.toLowerCase().includes(query)
    );
  }

  // Ordenamiento dinámico
  if (sort === "mileage-desc") {
    vehicles.sort((a, b) => b.currentMileage - a.currentMileage);
  } else if (sort === "mileage-asc") {
    vehicles.sort((a, b) => a.currentMileage - b.currentMileage);
  } else if (sort === "year-desc") {
    vehicles.sort((a, b) => b.year - a.year);
  } else if (sort === "year-asc") {
    vehicles.sort((a, b) => a.year - b.year);
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Mis Vehículos"
        description={
          vehicles.length > 0
            ? `${vehicles.length} vehículo${vehicles.length !== 1 ? "s" : ""} registrado${vehicles.length !== 1 ? "s" : ""}`
            : "Administrá tu flota"
        }
        action={{
          label: "Agregar vehículo",
          href: "/dashboard/vehicles/new",
          icon: Plus,
        }}
      />

      <VehicleFilters />

      {vehicles.length === 0 ? (
        <div className="col-span-full py-16 flex flex-col items-center gap-4 text-center border border-dashed border-border rounded-xl bg-card/30">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
            <Car className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground">No se encontraron vehículos</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              {query ? "Probá modificando los términos del buscador." : "Comenzá agregando un vehículo."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {vehicles.map((vehicle: SerializableVehicle) => (
            <div key={vehicle.id} className="animate-fade-up">
              <VehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}