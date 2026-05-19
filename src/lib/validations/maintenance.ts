import { z } from "zod";
import { MaintenanceType } from "@prisma/client";

// ✅ CORRECTO: El error se define como mensaje directo en la configuración
const maintenanceTypeSchema = z.nativeEnum(MaintenanceType, {
  error: "Seleccioná un tipo de servicio válido",
});

export const createMaintenanceSchema = z.object({
  type: maintenanceTypeSchema,

  serviceDate: z
    .string()
    .min(1, "La fecha de servicio es requerida")
    .transform((val) => new Date(val)),

  mileage: z
    .coerce.number({ message: "El kilometraje debe ser un número" })
    .int("El kilometraje debe ser entero")
    .min(0, "El kilometraje no puede ser negativo"),

  // Manejo de FormData: Si viene "", lo transformamos en null
  cost: z
    .string()
    .optional()
    .transform((val) => (!val ? null : Number(val))),

  provider: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .transform((val) => (!val ? null : val.trim())),

  notes: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .transform((val) => (!val ? null : val.trim())),

  nextDueDate: z
    .string()
    .optional()
    .transform((val) => (!val ? null : new Date(val))),

  nextDueMileage: z
    .string()
    .optional()
    .transform((val) => (!val ? null : Number(val))),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;