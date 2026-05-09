import { z } from "zod"

const currentYear = new Date().getFullYear()

export const createVehicleSchema = z.object({
  nickname: z
    .string()
    .min(1, "El apodo del vehículo es requerido")
    .max(50, "Máximo 50 caracteres"),

  brand: z
    .string()
    .min(1, "La marca es requerida")
    .max(50, "Máximo 50 caracteres"),

  model: z
    .string()
    .min(1, "El modelo es requerido")
    .max(50, "Máximo 50 caracteres"),

  year: z
  .coerce.number() // Primero el coerce
  .int("El año debe ser un número entero")
  .min(1900, "Año mínimo: 1900")
  .max(currentYear + 1, `Año máximo: ${currentYear + 1}`),


  licensePlate: z
    .string()
    .max(15, "Máximo 15 caracteres")
    .transform((val) => val.toUpperCase().trim())
    .optional()
    .or(z.literal("")),

  vin: z
    .string()
    .length(17, "El VIN debe tener exactamente 17 caracteres")
    .toUpperCase()
    .optional()
    .or(z.literal("")),

  currentMileage: z
    .coerce.number() 
    .int("El kilometraje debe ser entero")
    .min(0, "El kilometraje no puede ser negativo")
    .default(0),

  imageUrl: z
    .string()
    .url("URL de imagen inválida")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
})

export const updateVehicleSchema = createVehicleSchema.partial()

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>