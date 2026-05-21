"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVehicle, updateVehicle } from "@/actions/vehicles";
import type { SerializableVehicle } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────
interface VehicleFormProps {
  vehicle?: SerializableVehicle; // undefined = creación, definido = edición
}

// ─── Helper: mensaje de error por campo ───────────────────────────────────────
function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="flex items-center gap-1 text-sm text-red-400 mt-1">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {errors[0]}
    </p>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estado de errores
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isEditing = !!vehicle;

  function clearErrors() {
    setFieldErrors({});
    setGeneralError(null);
  }

  async function handleSubmit(formData: FormData) {
    clearErrors();

    startTransition(async () => {
      const result = isEditing
        ? await updateVehicle(vehicle.id, formData)
        : await createVehicle(formData);

      if (!result.success) {
        setGeneralError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      router.push(`/dashboard/vehicles/${result.data.id}`);
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
        <form action={handleSubmit} className="space-y-4">

          {/* ── Error general (no asociado a un campo) ── */}
          {generalError && !Object.keys(fieldErrors).length && (
            <div className="flex items-center gap-2 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {generalError}
            </div>
          )}

          {/* ── Nickname ── */}
          <div className="space-y-1">
            <Label htmlFor="nickname">Apodo del vehículo *</Label>
            <Input
              id="nickname"
              name="nickname"
              defaultValue={vehicle?.nickname}
              placeholder="Mi Gol, El Camioneta…"
              required
              aria-invalid={!!fieldErrors.nickname}
              className={fieldErrors.nickname ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            <FieldError errors={fieldErrors.nickname} />
          </div>

          {/* ── Marca y Modelo ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={vehicle?.brand}
                placeholder="Toyota"
                required
                aria-invalid={!!fieldErrors.brand}
                className={fieldErrors.brand ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.brand} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                name="model"
                defaultValue={vehicle?.model}
                placeholder="Corolla"
                required
                aria-invalid={!!fieldErrors.model}
                className={fieldErrors.model ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.model} />
            </div>
          </div>

          {/* ── Año y Kilometraje ── */}
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
                aria-invalid={!!fieldErrors.year}
                className={fieldErrors.year ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.year} />
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
                aria-invalid={!!fieldErrors.currentMileage}
                className={fieldErrors.currentMileage ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.currentMileage} />
            </div>
          </div>

          {/* ── Patente y VIN (opcionales) ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="licensePlate">Patente</Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                defaultValue={vehicle?.licensePlate ?? ""}
                placeholder="AA123BB"
                aria-invalid={!!fieldErrors.licensePlate}
                className={fieldErrors.licensePlate ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.licensePlate} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vin">VIN / Chasis</Label>
              <Input
                id="vin"
                name="vin"
                defaultValue={vehicle?.vin ?? ""}
                placeholder="1HGBH41JXMN109186"
                aria-invalid={!!fieldErrors.vin}
                className={fieldErrors.vin ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.vin} />
            </div>
          </div>

          {/* ── Notas ── */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={vehicle?.notes ?? ""}
              placeholder="Observaciones adicionales…"
              rows={3}
              aria-invalid={!!fieldErrors.notes}
              className={fieldErrors.notes ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            <FieldError errors={fieldErrors.notes} />
          </div>

          {/* ── Acciones ── */}
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