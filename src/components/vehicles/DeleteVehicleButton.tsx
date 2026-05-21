"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVehicle } from "@/actions/vehicles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────
interface DeleteVehicleButtonProps {
  vehicleId: string;
  vehicleName: string; // para mostrar en el mensaje de confirmación
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function DeleteVehicleButton({ vehicleId, vehicleName }: DeleteVehicleButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteVehicle(vehicleId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/dashboard/vehicles");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="gap-2" disabled={isPending}>
            <Trash2 className="h-4 w-4" />
            {isPending ? "Eliminando…" : "Eliminar vehículo"}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {vehicleName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminarán también todos los registros de
              mantenimiento, documentos y recordatorios asociados a este vehículo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? "Eliminando…" : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error inline si la acción falla */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}