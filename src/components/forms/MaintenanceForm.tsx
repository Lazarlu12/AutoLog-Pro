"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMaintenanceRecord } from "@/actions/maintenance";
import { MAINTENANCE_TYPE_LABELS } from "@/types/domain";
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface MaintenanceFormProps {
  vehicleId: string;
  currentMileage: number;
}

export function MaintenanceForm({ vehicleId, currentMileage }: MaintenanceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      // ✅ Orden correcto: vehicleId PRIMERO, formData SEGUNDO
      // TODO: Resolver error TS2345
      const result = await createMaintenanceRecord(vehicleId, formData);

      if (!result.success) {
        alert(result.error);
        return;
      }

      router.push(`/dashboard/vehicles/${vehicleId}`);
      router.refresh();
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Registrar mantenimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {/* Tipo de mantenimiento */}
          <div className="space-y-1">
            <Label htmlFor="type">Tipo de servicio *</Label>
            <Select name="type" required>
              <SelectTrigger>
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
          </div>

          {/* Fecha y Kilometraje */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="serviceDate">Fecha del servicio *</Label>
              <Input
                id="serviceDate"
                name="serviceDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
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
              />
            </div>
          </div>

          {/* Costo y Taller */}
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
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="provider">Taller / Proveedor</Label>
              <Input
                id="provider"
                name="provider"
                placeholder="AutoService Tucumán"
              />
            </div>
          </div>

          {/* Próximo servicio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="nextDueDate">Próxima fecha</Label>
              <Input id="nextDueDate" name="nextDueDate" type="date" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nextDueMileage">Próximo kilometraje</Label>
              <Input
                id="nextDueMileage"
                name="nextDueMileage"
                type="number"
                placeholder="62000"
                min={0}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Detalles adicionales del servicio…"
              rows={3}
            />
          </div>

          {/* Acciones */}
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