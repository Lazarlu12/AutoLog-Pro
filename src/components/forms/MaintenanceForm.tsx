"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMaintenanceRecord } from "@/actions/maintenance";
import { MAINTENANCE_TYPE_LABELS } from "@/types/domain";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────
interface MaintenanceFormProps {
  vehicleId: string;
  currentMileage: number;
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
export function MaintenanceForm({ vehicleId, currentMileage }: MaintenanceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estado de errores
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function clearErrors() {
    setFieldErrors({});
    setGeneralError(null);
  }

  function handleSubmit(formData: FormData) {
    clearErrors();
    startTransition(async () => {
      const result = await createMaintenanceRecord(vehicleId, formData);

      if (!result.success) {
        setGeneralError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        
        if (!result.fieldErrors) {
          toast.error(result.error || "Ocurrió un error inesperado");
        }
        return;
      }

      // Toast de éxito
      toast.success("Mantenimiento registrado");

      router.push(`/dashboard/vehicles/${vehicleId}`);
      // Eliminamos router.refresh()
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Registrar mantenimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">

          {/* ── Error general ── */}
          {generalError && !Object.keys(fieldErrors).length && (
            <div className="flex items-center gap-2 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {generalError}
            </div>
          )}

          {/* ── Tipo de servicio ── */}
          <div className="space-y-1">
            <Label htmlFor="type">Tipo de servicio *</Label>
            <Select name="type" required>
              <SelectTrigger
                className={fieldErrors.type ? "border-red-500 focus:ring-red-500" : ""}
              >
                <SelectValue placeholder="Seleccioná el tipo…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={fieldErrors.type} />
          </div>

          {/* ── Fecha y Kilometraje ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="serviceDate">Fecha del servicio *</Label>
              <Input
                id="serviceDate"
                name="serviceDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
                aria-invalid={!!fieldErrors.serviceDate}
                className={fieldErrors.serviceDate ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.serviceDate} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mileage">Kilometraje al momento *</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                placeholder="52000"
                min={0}
                defaultValue={currentMileage.toString()}
                required
                aria-invalid={!!fieldErrors.mileage}
                className={fieldErrors.mileage ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.mileage} />
            </div>
          </div>

          {/* ── Costo y Proveedor ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                placeholder="0.00"
                min={0}
                step="0.01"
                aria-invalid={!!fieldErrors.cost}
                className={fieldErrors.cost ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.cost} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="provider">Taller / Proveedor</Label>
              <Input
                id="provider"
                name="provider"
                placeholder="AutoService Tucumán"
                aria-invalid={!!fieldErrors.provider}
                className={fieldErrors.provider ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.provider} />
            </div>
          </div>

          {/* ── Próxima fecha y kilometraje ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="nextDueDate">Próxima fecha</Label>
              <Input
                id="nextDueDate"
                name="nextDueDate"
                type="date"
                aria-invalid={!!fieldErrors.nextDueDate}
                className={fieldErrors.nextDueDate ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.nextDueDate} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nextDueMileage">Próximo kilometraje</Label>
              <Input
                id="nextDueMileage"
                name="nextDueMileage"
                type="number"
                placeholder="62000"
                min={0}
                aria-invalid={!!fieldErrors.nextDueMileage}
                className={fieldErrors.nextDueMileage ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <FieldError errors={fieldErrors.nextDueMileage} />
            </div>
          </div>

          {/* ── Notas ── */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Detalles adicionales del servicio…"
              rows={3}
              aria-invalid={!!fieldErrors.notes}
              className={fieldErrors.notes ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            <FieldError errors={fieldErrors.notes} />
          </div>

          {/* ── Acciones ── */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : "Registrar mantenimiento"}
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