"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { prisma } from "@/src/lib/prisma"
import { requireAuth } from "@/src/lib/auth"
import {
  createVehicleSchema,
  updateVehicleSchema,
  type CreateVehicleInput,
  type UpdateVehicleInput,
} from "@/src/lib/validations/vehicle"
import { ok, fail, type ActionResult } from "@/src/types/actions"
import type { Vehicle } from "@prisma/client"

// ─────────────────────────────────────────────
// HELPER INTERNO: ownership check
// ─────────────────────────────────────────────

async function getOwnedVehicle(
  vehicleId: string,
  dbUserId: string
): Promise<Vehicle | null> {
  return prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId: dbUserId,
    },
  })
}

// ─────────────────────────────────────────────
// HELPER INTERNO: detectar error de VIN duplicado
// ─────────────────────────────────────────────

/**
 * El VIN tiene @unique global en el schema.
 * Prisma lanza un P2002 si se intenta insertar/actualizar con un VIN ya existente.
 * Lo atrapamos acá para devolver un mensaje legible en lugar de un error genérico.
 */
function isVinUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    (error.meta.target as string[]).includes("vin")
  )
}

// ─────────────────────────────────────────────
// 1. CREATE VEHICLE
// ─────────────────────────────────────────────

export async function createVehicle(
  input: CreateVehicleInput
): Promise<ActionResult<Vehicle>> {
  try {
    const dbUser = await requireAuth()

    const parsed = createVehicleSchema.safeParse(input)
    if (!parsed.success) {
      return fail("Datos inválidos", parsed.error.flatten().fieldErrors)
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        ...parsed.data,
        // Normalizar strings vacíos a null para campos opcionales de DB
        vin: parsed.data.vin || null,
        licensePlate: parsed.data.licensePlate || null,
        imageUrl: parsed.data.imageUrl || null,
        notes: parsed.data.notes || null,
        userId: dbUser.id,
      },
    })

    revalidatePath("/dashboard/vehicles")

    return ok(vehicle)
  } catch (error) {
    if (isVinUniqueError(error)) {
      return fail("Ese VIN ya está registrado en el sistema")
    }
    console.error("[createVehicle]", error)
    return fail("Error interno al crear el vehículo")
  }
}

// ─────────────────────────────────────────────
// 2. GET ALL VEHICLES
// ─────────────────────────────────────────────

export async function getVehiclesByUser(): Promise<ActionResult<Vehicle[]>> {
  try {
    const dbUser = await requireAuth()

    const vehicles = await prisma.vehicle.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    })

    return ok(vehicles)
  } catch (error) {
    console.error("[getVehiclesByUser]", error)
    return fail("Error al obtener los vehículos")
  }
}

// ─────────────────────────────────────────────
// 3. GET VEHICLE BY ID + ownership check
// ─────────────────────────────────────────────

export async function getVehicleById(
  vehicleId: string
): Promise<ActionResult<Vehicle>> {
  try {
    if (!vehicleId) return fail("ID de vehículo requerido")

    const dbUser = await requireAuth()

    const vehicle = await getOwnedVehicle(vehicleId, dbUser.id)
    if (!vehicle) return fail("Vehículo no encontrado")

    return ok(vehicle)
  } catch (error) {
    console.error("[getVehicleById]", error)
    return fail("Error al obtener el vehículo")
  }
}

// ─────────────────────────────────────────────
// 4. UPDATE VEHICLE + ownership check
// ─────────────────────────────────────────────

export async function updateVehicle(
  vehicleId: string,
  input: UpdateVehicleInput
): Promise<ActionResult<Vehicle>> {
  try {
    if (!vehicleId) return fail("ID de vehículo requerido")

    const dbUser = await requireAuth()

    const parsed = updateVehicleSchema.safeParse(input)
    if (!parsed.success) {
      return fail("Datos inválidos", parsed.error.flatten().fieldErrors)
    }

    // Ownership check antes de cualquier escritura
    const existing = await getOwnedVehicle(vehicleId, dbUser.id)
    if (!existing) return fail("Vehículo no encontrado")

    const updated = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...parsed.data,
        // Normalizar strings vacíos a null
        vin: parsed.data.vin !== undefined
          ? (parsed.data.vin || null)
          : undefined,
        licensePlate: parsed.data.licensePlate !== undefined
          ? (parsed.data.licensePlate || null)
          : undefined,
        imageUrl: parsed.data.imageUrl !== undefined
          ? (parsed.data.imageUrl || null)
          : undefined,
        notes: parsed.data.notes !== undefined
          ? (parsed.data.notes || null)
          : undefined,
      },
    })

    revalidatePath("/dashboard/vehicles")
    revalidatePath(`/dashboard/vehicles/${vehicleId}`)

    return ok(updated)
  } catch (error) {
    if (isVinUniqueError(error)) {
      return fail("Ese VIN ya está registrado en el sistema")
    }
    console.error("[updateVehicle]", error)
    return fail("Error al actualizar el vehículo")
  }
}

// ─────────────────────────────────────────────
// 5. DELETE VEHICLE + ownership check
// ─────────────────────────────────────────────

export async function deleteVehicle(
  vehicleId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!vehicleId) return fail("ID de vehículo requerido")

    const dbUser = await requireAuth()

    const existing = await getOwnedVehicle(vehicleId, dbUser.id)
    if (!existing) return fail("Vehículo no encontrado")

    // onDelete: Cascade ya está en el schema para MaintenanceRecord, Document y Reminder
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    })

    revalidatePath("/dashboard/vehicles")

    return ok({ id: vehicleId })
  } catch (error) {
    console.error("[deleteVehicle]", error)
    return fail("Error al eliminar el vehículo")
  }
}