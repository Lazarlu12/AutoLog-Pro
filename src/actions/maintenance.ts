"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/src/lib/prisma"
import { requireAuth } from "@/src/lib/auth"
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  type CreateMaintenanceInput,
  type UpdateMaintenanceInput,
} from "@/src/lib/validations/maintenance"
import { ok, fail, type ActionResult } from "@/src/types/actions"
import type { SerializableMaintenanceRecord } from "@/src/types/actions"

// ─────────────────────────────────────────────
// HELPER: convertir Decimal → number para serialización
// ─────────────────────────────────────────────

function serializeRecord(
  record: Awaited<ReturnType<typeof prisma.maintenanceRecord.findFirstOrThrow>>
): SerializableMaintenanceRecord {
  return {
    ...record,
    cost: record.cost ? Number(record.cost) : null,
  }
}

// ─────────────────────────────────────────────
// HELPER: verificar que el vehículo pertenece al usuario
// Reutilizable internamente en todas las actions de esta fase
// ─────────────────────────────────────────────

async function verifyVehicleOwnership(
  vehicleId: string,
  dbUserId: string
): Promise<boolean> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: dbUserId },
    select: { id: true }, // solo necesitamos saber si existe
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
// 1. CREATE MAINTENANCE RECORD
// ─────────────────────────────────────────────

export async function createMaintenanceRecord(
  vehicleId: string,
  input: CreateMaintenanceInput
): Promise<ActionResult<SerializableMaintenanceRecord>> {
  try {
    if (!vehicleId) return fail("ID de vehículo requerido")

    const dbUser = await requireAuth()

    // Verificar que el vehículo pertenece al usuario antes de escribir
    const ownsVehicle = await verifyVehicleOwnership(vehicleId, dbUser.id)
    if (!ownsVehicle) return fail("Vehículo no encontrado")

    const parsed = createMaintenanceSchema.safeParse(input)
    if (!parsed.success) {
      return fail("Datos inválidos", parsed.error.flatten().fieldErrors)
    }

    const record = await prisma.maintenanceRecord.create({
      data: {
        vehicleId,
        type: parsed.data.type,
        serviceDate: parsed.data.serviceDate,
        mileage: parsed.data.mileage,
        cost: parsed.data.cost ?? null,
        provider: parsed.data.provider || null,
        notes: parsed.data.notes || null,
        nextDueDate: parsed.data.nextDueDate ?? null,
        nextDueMileage: parsed.data.nextDueMileage ?? null,
      },
    })

    // Al crear un registro de mantenimiento se dispara el trigger
    // `create_reminder_from_maintenance` que definiste en Supabase.
    // No necesitamos crear el Reminder manualmente acá.

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

    // Ownership check del vehículo
    const ownsVehicle = await verifyVehicleOwnership(vehicleId, dbUser.id)
    if (!ownsVehicle) return fail("Vehículo no encontrado")

    const records = await prisma.maintenanceRecord.findMany({
      where: { vehicleId },
      orderBy: { serviceDate: "desc" }, // más reciente primero
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
// 4. UPDATE MAINTENANCE RECORD + ownership check
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
      return fail("Datos inválidos", parsed.error.flatten().fieldErrors)
    }

    // Ownership check via JOIN — un solo query
    const existing = await getOwnedRecord(recordId, dbUser.id)
    if (!existing) return fail("Registro no encontrado")

    const updated = await prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: {
        ...parsed.data,
        // Normalizar opcionales: undefined = no tocar, null = borrar
        cost: parsed.data.cost !== undefined
          ? (parsed.data.cost ?? null)
          : undefined,
        provider: parsed.data.provider !== undefined
          ? (parsed.data.provider || null)
          : undefined,
        notes: parsed.data.notes !== undefined
          ? (parsed.data.notes || null)
          : undefined,
        nextDueDate: parsed.data.nextDueDate !== undefined
          ? parsed.data.nextDueDate
          : undefined,
        nextDueMileage: parsed.data.nextDueMileage !== undefined
          ? (parsed.data.nextDueMileage ?? null)
          : undefined,
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
// 5. DELETE MAINTENANCE RECORD + ownership check
// ─────────────────────────────────────────────

export async function deleteMaintenanceRecord(
  recordId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!recordId) return fail("ID de registro requerido")

    const dbUser = await requireAuth()

    // Ownership check — también guardamos vehicleId para el revalidatePath
    const existing = await getOwnedRecord(recordId, dbUser.id)
    if (!existing) return fail("Registro no encontrado")

    // onDelete: SetNull en Reminder y Document (según tu schema)
    // → los Reminders vinculados quedan con maintenanceRecordId = null
    // → los Documents vinculados quedan con maintenanceRecordId = null
    // Los registros NO se eliminan — solo se desvinculan del mantenimiento
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