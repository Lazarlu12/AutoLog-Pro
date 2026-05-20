import { notFound } from "next/navigation";
import { getVehicleById } from "@/actions/vehicles";
import { PageHeader } from "@/components/ui/page-header";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";
import type { Metadata } from "next";

interface NewMaintenancePageProps {
  params: Promise<{ vehicleId: string }>;
}

export async function generateMetadata({ params }: NewMaintenancePageProps): Promise<Metadata> {
  const { vehicleId } = await params;
  const result = await getVehicleById(vehicleId);
  if (!result.success) return { title: "Registrar mantenimiento" };
  return { title: `Registrar mantenimiento — ${result.data.nickname}` };
}

export default async function NewMaintenancePage({ params }: NewMaintenancePageProps) {
  const { vehicleId } = await params;
  const result = await getVehicleById(vehicleId);

  if (!result.success) notFound();

  const vehicle = result.data;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title="Registrar mantenimiento"
        description={`${vehicle.nickname} · ${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mis Vehículos", href: "/dashboard/vehicles" },
          { label: vehicle.nickname, href: `/dashboard/vehicles/${vehicleId}` },
        ]}
      />
      <MaintenanceForm
        vehicleId={vehicleId}
        currentMileage={vehicle.currentMileage}
      />
    </div>
  );
}