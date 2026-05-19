"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createMaintenanceSchema } from "@/lib/validations/maintenance";
import { ok, fail, type ActionResult } from "@/types/actions";
import type { SerializableMaintenanceRecord } from "@/types/domain";

// Helper de serialización
function serializeRecord(record: any): SerializableMaintenanceRecord {
  return {
    ...record,
    cost: record.cost ? Number(record.cost) : null,
  };
}

export async function createMaintenanceRecord(
  vehicleId: string,
  formData: FormData // ← CAMBIO CLAVE: Ahora acepta FormData directamente
): Promise<ActionResult<SerializableMaintenanceRecord>> {
  try {
    if (!vehicleId) return fail("ID de vehículo requerido");

    const dbUser = await requireAuth();

    // 1. Verificación de propiedad
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: dbUser.id },
    });
    if (!vehicle) return fail("Vehículo no encontrado o sin permisos");

    // 2. Extraer y validar datos
    const rawData = Object.fromEntries(formData.entries());
    const parsed = createMaintenanceSchema.safeParse(rawData);

    if (!parsed.success) {
      // Le decimos a TypeScript que trate los errores exactamente como los espera tu función fail()
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      
      console.error("Errores Zod:", fieldErrors);
      return fail("Datos inválidos, por favor revisá el formulario", fieldErrors);
    }

    // 3. Escribir en base de datos
    const record = await prisma.maintenanceRecord.create({
      data: {
        vehicleId,
        type: parsed.data.type,
        serviceDate: parsed.data.serviceDate,
        mileage: parsed.data.mileage,
        cost: parsed.data.cost,
        provider: parsed.data.provider,
        notes: parsed.data.notes,
        nextDueDate: parsed.data.nextDueDate,
        nextDueMileage: parsed.data.nextDueMileage,
      },
    });

    // 4. Actualizar caché del frontend
    revalidatePath(`/dashboard/vehicles/${vehicleId}`);
    revalidatePath(`/dashboard/vehicles/${vehicleId}/maintenance`);

    return ok(serializeRecord(record));
  } catch (error) {
    console.error("[createMaintenanceRecord]", error);
    return fail("Error interno al crear el registro");
  }
}