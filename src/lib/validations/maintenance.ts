import { z } from "zod"
import { MaintenanceType } from "@prisma/client"

// Zod enum construido desde el enum real de Prisma
// Si agregás un valor al enum en el schema, acá se actualiza automáticamente
const maintenanceTypeSchema = z.nativeEnum(MaintenanceType)

export const createMaintenanceSchema = z.object({
  type: maintenanceTypeSchema,

  serviceDate: z
    .string()
    .min(1, "La fecha de servicio es requerida")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha de servicio inválida",
    })
    .transform((val) => new Date(val)),

  mileage: z
    .coerce.number({ message: "El kilometraje debe ser un número" })
    .int("El kilometraje debe ser entero")
    .min(1, "El kilometraje es requerido"),

  cost: z
    .coerce.number({ message: "El costo debe ser un número" })
    .min(0, "El costo no puede ser negativo")
    .multipleOf(0.01, "Máximo 2 decimales")
    .optional(),

  provider: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),

  nextDueDate: z
    .string()
    .refine((val) => val === "" || !isNaN(Date.parse(val)), {
      message: "Fecha próxima inválida",
    })
    .transform((val) => (val ? new Date(val) : null))
    .optional(),

  nextDueMileage: z
    .coerce.number({ message: "El kilometraje próximo debe ser un número" })
    .int("Debe ser entero")
    .min(1, "El kilometraje próximo es requerido")
    .optional(),
})

export const updateMaintenanceSchema = createMaintenanceSchema.partial()

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>