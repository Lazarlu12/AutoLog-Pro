"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createVehicle, updateVehicle } from "@/actions/vehicles";
import type { SerializableVehicle } from "@/types/domain";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

interface VehicleFormProps {
  /** Si se pasa, el form opera en modo EDICIÓN */
  vehicle?: SerializableVehicle;
}

interface FieldError {
  [key: string]: string[] | undefined;
}

/* ─── Helper visual ──────────────────────────────────────────────────────── */

function Field({
  label,
  id,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string[];
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error[0]}
        </p>
      )}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  const isEditing = !!vehicle;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEditing
        ? await updateVehicle(vehicle.id, formData)
        : await createVehicle(formData);

      if (!result.success) {
        setGlobalError(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors as FieldError);
        }
        return;
      }

      // Redirigir al detalle del vehículo creado/editado
      const vehicleId = isEditing ? vehicle.id : (result.data as SerializableVehicle).id;
      router.push(`/dashboard/vehicles/${vehicleId}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error global */}
      {globalError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {globalError}
        </div>
      )}

      {/* ── Sección principal ─────────────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Apodo / Nombre" id="nickname" required error={fieldErrors.nickname}>
            <Input
              id="nickname"
              name="nickname"
              defaultValue={vehicle?.nickname}
              placeholder='Ej: "Mi Corolla", "La moto"'
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
            />
          </Field>

          <Field label="Marca" id="brand" required error={fieldErrors.brand}>
            <Input
              id="brand"
              name="brand"
              defaultValue={vehicle?.brand}
              placeholder="Toyota, Honda, Ford..."
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
            />
          </Field>

          <Field label="Modelo" id="model" required error={fieldErrors.model}>
            <Input
              id="model"
              name="model"
              defaultValue={vehicle?.model}
              placeholder="Corolla, Civic, Ranger..."
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
            />
          </Field>

          <Field label="Año" id="year" required error={fieldErrors.year}>
            <Input
              id="year"
              name="year"
              type="number"
              defaultValue={vehicle?.year}
              placeholder="2020"
              min={1900}
              max={new Date().getFullYear() + 1}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
            />
          </Field>

          <Field
            label="Kilometraje actual"
            id="currentMileage"
            required
            error={fieldErrors.currentMileage}
            hint="Podés actualizarlo cada vez que registres un mantenimiento"
          >
            <div className="relative">
              <Input
                id="currentMileage"
                name="currentMileage"
                type="number"
                defaultValue={vehicle?.currentMileage}
                placeholder="45000"
                min={0}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                km
              </span>
            </div>
          </Field>

          <Field
            label="Patente"
            id="licensePlate"
            error={fieldErrors.licensePlate}
            hint="Opcional"
          >
            <Input
              id="licensePlate"
              name="licensePlate"
              defaultValue={vehicle?.licensePlate ?? ""}
              placeholder="ABC 123"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary uppercase"
            />
          </Field>

          <Field
            label="VIN / Número de chasis"
            id="vin"
            error={fieldErrors.vin}
            hint="Opcional — 17 caracteres"
          >
            <Input
              id="vin"
              name="vin"
              defaultValue={vehicle?.vin ?? ""}
              placeholder="1HGBH41JXMN109186"
              maxLength={17}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary font-mono text-sm"
            />
          </Field>

          <Field label="Notas" id="notes" error={fieldErrors.notes}>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={vehicle?.notes ?? ""}
              placeholder="Observaciones, modificaciones, datos útiles..."
              rows={3}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary resize-none md:col-span-2"
            />
          </Field>

        </CardContent>
      </Card>

      {/* ── Acciones ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            "bg-primary text-primary-foreground hover:bg-primary/90 min-w-28",
            isPending && "opacity-70 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              {isEditing ? "Guardando..." : "Creando..."}
            </>
          ) : (
            isEditing ? "Guardar cambios" : "Crear vehículo"
          )}
        </Button>
      </div>
    </form>
  );
}