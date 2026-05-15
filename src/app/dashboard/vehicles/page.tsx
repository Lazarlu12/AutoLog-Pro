import Link from "next/link";
import { getVehiclesByUser } from "@/actions/vehicles";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatMileage(km: number): string {
  return km.toLocaleString("es-AR") + " km";
}

/* ─── Vehicle card ───────────────────────────────────────────────────────── */

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
                {vehicle.licensePlate}
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

/* ─── Empty state ────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="col-span-full py-16 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
        <Car className="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-display font-semibold text-foreground">Sin vehículos todavía</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          Agregá tu primer vehículo para empezar a registrar su historial de mantenimiento.
        </p>
      </div>
      <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
        <Link href="/dashboard/vehicles/new">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Agregar vehículo
        </Link>
      </Button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function VehiclesPage() {
  const result = await getVehiclesByUser();
  const vehicles: SerializableVehicle[] = result.success ? result.data : [];

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

      {vehicles.length === 0 ? (
        <div className="grid">
          <EmptyState />
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