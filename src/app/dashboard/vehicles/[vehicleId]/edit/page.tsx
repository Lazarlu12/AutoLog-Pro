import { notFound } from "next/navigation";
import { getVehicleById } from "@/actions/vehicles";
import { PageHeader } from "@/components/ui/page-header";
import  VehicleForm  from "@/components/forms/VehicleForm";
import type { Metadata } from "next";

interface EditVehiclePageProps {
  params: Promise<{ vehicleId: string }>;
}

export async function generateMetadata({ params }: EditVehiclePageProps): Promise<Metadata> {
  const { vehicleId } = await params;
  const result = await getVehicleById(vehicleId);
  if (!result.success) return { title: "Editar vehículo" };
  return { title: `Editar — ${result.data.nickname}` };
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { vehicleId } = await params;
  const result = await getVehicleById(vehicleId);

  if (!result.success) notFound();

  const vehicle = result.data;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title={`Editar ${vehicle.nickname}`}
        description="Actualizá los datos de tu vehículo."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mis Vehículos", href: "/dashboard/vehicles" },
          { label: vehicle.nickname, href: `/dashboard/vehicles/${vehicleId}` },
        ]}
      />
      <VehicleForm vehicle={vehicle} /> 
    </div>
  );
}