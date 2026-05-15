"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, Calendar, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { createMaintenanceRecord } from "@/actions/maintenance";
import { MAINTENANCE_TYPE_LABELS } from "@/types/domain";
import type { MaintenanceType } from "@/types/domain";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

interface MaintenanceFormProps {
  vehicleId: string;
  currentMileage: number;
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

export function MaintenanceForm({ vehicleId, currentMileage }: MaintenanceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [selectedType, setSelectedType] = useState<MaintenanceType | "">("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createMaintenanceRecord(formData);

      if (!result.success) {
        setGlobalError(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors as FieldError);
        }
        return;
      }

      router.push(`/dashboard/vehicles/${vehicleId}`);
      router.refresh();
    });
  }

  // Hoy como default para la fecha
  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo oculto — vehicleId */}
      <input type="hidden" name="vehicleId" value={vehicleId} />

      {/* Error global */}
      {globalError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {globalError}
        </div>
      )}

      {/* ── Datos principales ────────────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            Datos del servicio
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Tipo de mantenimiento" id="type" required error={fieldErrors.type}>
            <Select
              name="type"
              value={selectedType}
              onValueChange={(v) => setSelectedType(v as MaintenanceType)}
            >
              <SelectTrigger
                id="type"
                className="bg-secondary border-border text-foreground focus:ring-primary"
              >
                <SelectValue placeholder="Seleccioná el tipo" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {(Object.keys(MAINTENANCE_TYPE_LABELS) as MaintenanceType[]).map((key) => (
                  <SelectItem key={key} value={key} className="text-foreground focus:bg-secondary focus:text-foreground">
                    {MAINTENANCE_TYPE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Fecha del servicio" id="serviceDate" required error={fieldErrors.serviceDate}>
            <div className="relative">
              <Input
                id="serviceDate"
                name="serviceDate"
                type="date"
                defaultValue={todayISO}
                max={todayISO}
                className="bg-secondary border-border text-foreground focus-visible:ring-primary pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </Field>

          <Field
            label="Kilometraje al momento del servicio"
            id="mileage"
            required
            error={fieldErrors.mileage}
            hint={`Kilometraje actual del vehículo: ${currentMileage.toLocaleString("es-AR")} km`}
          >
            <div className="relative">
              <Input
                id="mileage"
                name="mileage"
                type="number"
                defaultValue={currentMileage}
                min={0}
                className="bg-secondary border-border text-foreground focus-visible:ring-primary pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">km</span>
            </div>
          </Field>

          <Field label="Costo" id="cost" error={fieldErrors.cost} hint="Opcional">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                className="bg-secondary border-border text-foreground focus-visible:ring-primary pl-7 placeholder:text-muted-foreground/50"
              />
            </div>
          </Field>

          <Field
            label="Taller / Proveedor"
            id="provider"
            error={fieldErrors.provider}
            hint="Opcional"
          >
            <Input
              id="provider"
              name="provider"
              placeholder="Nombre del taller o mecánico"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary"
            />
          </Field>

          <Field label="Notas" id="notes" error={fieldErrors.notes}>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Detalles del servicio, piezas reemplazadas..."
              rows={3}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary resize-none"
            />
          </Field>

        </CardContent>
      </Card>

      {/* ── Próximo servicio ─────────────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            Próximo servicio
            <span className="text-[11px] font-normal text-muted-foreground">(opcional — genera recordatorio automático)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field
            label="Fecha límite"
            id="nextDueDate"
            error={fieldErrors.nextDueDate}
            hint="Ej: vencimiento del seguro o VTV"
          >
            <div className="relative">
              <Input
                id="nextDueDate"
                name="nextDueDate"
                type="date"
                min={todayISO}
                className="bg-secondary border-border text-foreground focus-visible:ring-primary pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </Field>

          <Field
            label="Kilometraje límite"
            id="nextDueMileage"
            error={fieldErrors.nextDueMileage}
            hint="Ej: próximo cambio de aceite a los 10.000 km"
          >
            <div className="relative">
              <Input
                id="nextDueMileage"
                name="nextDueMileage"
                type="number"
                min={currentMileage}
                placeholder={String(currentMileage + 10000)}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary pr-10"
              />
              <Gauge className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </Field>

        </CardContent>
      </Card>

      {/* ── Acciones ─────────────────────────────────────────────────── */}
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
            "bg-primary text-primary-foreground hover:bg-primary/90 min-w-32",
            isPending && "opacity-70 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrar mantenimiento"
          )}
        </Button>
      </div>
    </form>
  );
}