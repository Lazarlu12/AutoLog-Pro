import { notFound } from "next/navigation";
import { getVehicleById } from "@/actions/vehicles";
import { PageHeader } from "@/components/ui/page-header";
import VehicleForm from "@/components/forms/VehicleForm";
import { DeleteVehicleButton } from "@/components/vehicles/DeleteVehicleButton";
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
    <div className="max-w-2xl mx-auto animate-fade-in space-y-8">
      <PageHeader
        title={`Editar ${vehicle.nickname}`}
        description="Actualizá los datos de tu vehículo."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mis Vehículos", href: "/dashboard/vehicles" },
          { label: vehicle.nickname, href: `/dashboard/vehicles/${vehicleId}` },
        ]}
      />

      {/* ── Formulario de edición ── */}
      <VehicleForm vehicle={vehicle} />

      {/* ── Zona de peligro ── */}
      <div className="rounded-lg border border-red-900/40 bg-red-950/10 p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-1">Zona de peligro</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Al eliminar el vehículo se borrarán permanentemente todos sus registros de
          mantenimiento, documentos y recordatorios. Esta acción no se puede deshacer.
        </p>
        <DeleteVehicleButton
          vehicleId={vehicle.id}
          vehicleName={vehicle.nickname}
        />
      </div>
    </div>
  );
}