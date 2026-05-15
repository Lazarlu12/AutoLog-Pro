import { PageHeader } from "@/components/ui/page-header";
import { VehicleForm } from "@/components/forms/VehicleForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nuevo Vehículo" };

export default function NewVehiclePage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title="Agregar vehículo"
        description="Completá los datos de tu vehículo para empezar a registrar su mantenimiento."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mis Vehículos", href: "/dashboard/vehicles" },
        ]}
      />
      <VehicleForm />
    </div>
  );
}