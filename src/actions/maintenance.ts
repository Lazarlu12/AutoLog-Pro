"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  type UpdateMaintenanceInput,
} from "@/lib/validations/maintenance"
import { ok, fail, type ActionResult } from "@/types/actions"
import type { SerializableMaintenanceRecord } from "@/types/domain"

// ─────────────────────────────────────────────
// HELPER: convertir Decimal → number para serialización
// ─────────────────────────────────────────────
function serializeRecord(record: any): SerializableMaintenanceRecord {
  return {
    ...record,
    cost: record.cost ? Number(record.cost) : null,
  }
}

// ─────────────────────────────────────────────
// HELPER: verificar que el vehículo pertenece al usuario
// ─────────────────────────────────────────────
async function verifyVehicleOwnership(
  vehicleId: string,
  dbUserId: string
): Promise<boolean> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: dbUserId },
    select: { id: true }, 
  })
  return vehicle !== null
}

// ─────────────────────────────────────────────
// HELPER: obtener un registro verificando ownership
// via JOIN implícito en la query (un solo round-trip a DB)
// ─────────────────────────────────────────────
async function getOwnedRecord(recordId: string, dbUserId: string) {
  return prisma.maintenanceRecord.findFirst({
    where: {
      id: recordId,
      vehicle: {        // ← Prisma hace el JOIN automáticamente
        userId: dbUserId,
      },
    },
  })
}

// ─────────────────────────────────────────────
// 1. CREATE MAINTENANCE RECORD (Actualizado para FormData)
// ─────────────────────────────────────────────
export async function createMaintenanceRecord(
  vehicleId: string,
  formData: FormData
): Promise<ActionResult<SerializableMaintenanceRecord>> {
  try {
    if (!vehicleId) return fail("ID de vehículo requerido")

    const dbUser = await requireAuth()

    // Verificar que el vehículo pertenece al usuario antes de escribir [cite: 4]
    const ownsVehicle = await verifyVehicleOwnership(vehicleId, dbUser.id)
    if (!ownsVehicle) return fail("Vehículo no encontrado")

    const rawData = Object.fromEntries(formData.entries())
    const parsed = createMaintenanceSchema.safeParse(rawData)
    
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
      return fail("Datos inválidos", fieldErrors)
    }

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
    })

    // Al crear un registro de mantenimiento se dispara el trigger
    // `Tasks/Reminders_from_maintenance` que definiste en Supabase. [cite: 9]
    // No necesitamos crear el Reminder manualmente acá. [cite: 10]

    revalidatePath(`/dashboard/vehicles/${vehicleId}`)
    revalidatePath(`/dashboard/vehicles/${vehicleId}/maintenance`)

    return ok(serializeRecord(record))
  } catch (error) {
    console.error("[createMaintenanceRecord]", error)
    return fail("Error interno al crear el registro")
  }
}

// ─────────────────────────────────────────────
// 2. GET ALL MAINTENANCE BY VEHICLE
// ─────────────────────────────────────────────
export async function getMaintenanceByVehicle(
  vehicleId: string
): Promise<ActionResult<SerializableMaintenanceRecord[]>> {
  try {
    if (!vehicleId) return fail("ID de vehículo requerido")

    const dbUser = await requireAuth()

    const ownsVehicle = await verifyVehicleOwnership(vehicleId, dbUser.id)
    if (!ownsVehicle) return fail("Vehículo no encontrado")

    const records = await prisma.maintenanceRecord.findMany({
      where: { vehicleId },
      orderBy: { serviceDate: "desc" }, 
    })

    return ok(records.map(serializeRecord))
  } catch (error) {
    console.error("[getMaintenanceByVehicle]", error)
    return fail("Error al obtener los registros de mantenimiento")
  }
}

// ─────────────────────────────────────────────
// 3. GET SINGLE MAINTENANCE RECORD
// ─────────────────────────────────────────────
export async function getMaintenanceRecordById(
  recordId: string
): Promise<ActionResult<SerializableMaintenanceRecord>> {
  try {
    if (!recordId) return fail("ID de registro requerido")

    const dbUser = await requireAuth()

    const record = await getOwnedRecord(recordId, dbUser.id)
    if (!record) return fail("Registro no encontrado")

    return ok(serializeRecord(record))
  } catch (error) {
    console.error("[getMaintenanceRecordById]", error)
    return fail("Error al obtener el registro")
  }
}

// ─────────────────────────────────────────────
// 4. UPDATE MAINTENANCE RECORD
// ─────────────────────────────────────────────
export async function updateMaintenanceRecord(
  recordId: string,
  input: UpdateMaintenanceInput
): Promise<ActionResult<SerializableMaintenanceRecord>> {
  try {
    if (!recordId) return fail("ID de registro requerido")

    const dbUser = await requireAuth()

    const parsed = updateMaintenanceSchema.safeParse(input)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
      return fail("Datos inválidos", fieldErrors)
    }

    const existing = await getOwnedRecord(recordId, dbUser.id)
    if (!existing) return fail("Registro no encontrado")

    const updated = await prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: {
        ...parsed.data,
        cost: parsed.data.cost !== undefined ? (parsed.data.cost ?? null) : undefined,
        provider: parsed.data.provider !== undefined ? (parsed.data.provider || null) : undefined,
        notes: parsed.data.notes !== undefined ? (parsed.data.notes || null) : undefined,
        nextDueDate: parsed.data.nextDueDate !== undefined ? parsed.data.nextDueDate : undefined,
        nextDueMileage: parsed.data.nextDueMileage !== undefined ? (parsed.data.nextDueMileage ?? null) : undefined,
      },
    })

    revalidatePath(`/dashboard/vehicles/${existing.vehicleId}`)
    revalidatePath(`/dashboard/vehicles/${existing.vehicleId}/maintenance`)

    return ok(serializeRecord(updated))
  } catch (error) {
    console.error("[updateMaintenanceRecord]", error)
    return fail("Error al actualizar el registro")
  }
}

// ─────────────────────────────────────────────
// 5. DELETE MAINTENANCE RECORD
// ─────────────────────────────────────────────
export async function deleteMaintenanceRecord(
  recordId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!recordId) return fail("ID de registro requerido")

    const dbUser = await requireAuth()

    // Ownership check — también guardamos vehicleId para el revalidatePath [cite: 20]
    const existing = await getOwnedRecord(recordId, dbUser.id)
    if (!existing) return fail("Registro no encontrado")

    await prisma.maintenanceRecord.delete({
      where: { id: recordId },
    })

    revalidatePath(`/dashboard/vehicles/${existing.vehicleId}`)
    revalidatePath(`/dashboard/vehicles/${existing.vehicleId}/maintenance`)

    return ok({ id: recordId })
  } catch (error) {
    console.error("[deleteMaintenanceRecord]", error)
    return fail("Error al eliminar el registro")
  }
}