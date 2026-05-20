"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVehicle, updateVehicle } from "@/actions/vehicles";
import type { SerializableVehicle } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Props ────────────────────────────────────────────────────────────────────
// vehicle es SerializableVehicle (fechas como string), nunca el tipo de Prisma.

interface VehicleFormProps {
  vehicle?: SerializableVehicle; // ← undefined = modo creación, definido = modo edición
}

export default function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = !!vehicle;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateVehicle(vehicle.id, formData)
        : await createVehicle(formData);

      if (!result.success) {
        alert(result.error);
        return;
      }

      // ✅ result.data está correctamente tipado como SerializableVehicle
      const vehicleId = result.data.id;
      router.push(`/dashboard/vehicles/${vehicleId}`);
      router.refresh();
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? `Editar ${vehicle.nickname}` : "Agregar vehículo"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {/* Nickname */}
          <div className="space-y-1">
            <Label htmlFor="nickname">Apodo del vehículo *</Label>
            <Input
              id="nickname"
              name="nickname"
              defaultValue={vehicle?.nickname}
              placeholder="Mi Gol, El Camioneta…"
              required
            />
          </div>

          {/* Marca y Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={vehicle?.brand}
                placeholder="Toyota"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                name="model"
                defaultValue={vehicle?.model}
                placeholder="Corolla"
                required
              />
            </div>
          </div>

          {/* Año y Kilometraje */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                defaultValue={vehicle?.year}
                placeholder="2020"
                min={1900}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currentMileage">Kilometraje actual *</Label>
              <Input
                id="currentMileage"
                name="currentMileage"
                type="number"
                defaultValue={vehicle?.currentMileage}
                placeholder="50000"
                min={0}
                required
              />
            </div>
          </div>

          {/* Patente y VIN (opcionales) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="licensePlate">Patente</Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                defaultValue={vehicle?.licensePlate ?? ""}
                placeholder="AA123BB"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vin">VIN / Chasis</Label>
              <Input
                id="vin"
                name="vin"
                defaultValue={vehicle?.vin ?? ""}
                placeholder="1HGBH41JXMN109186"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={vehicle?.notes ?? ""}
              placeholder="Observaciones adicionales…"
              rows={3}
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Agregar vehículo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}