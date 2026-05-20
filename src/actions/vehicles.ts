"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createVehicleSchema } from "@/lib/validations/vehicle";
import { ok, fail } from "@/types/actions";
import type { ActionResult } from "@/types/actions";
import type { SerializableVehicle } from "@/types/domain";
import type { Vehicle } from "@prisma/client";

// ─── Helper de serialización ─────────────────────────────────────────────────
// Convierte los campos Date de Prisma a string ISO antes de enviar al cliente.

function serializeVehicle(v: Vehicle): SerializableVehicle {
  return {
    id:             v.id,
    userId:         v.userId,
    nickname:       v.nickname,
    brand:          v.brand,
    model:          v.model,
    year:           v.year,
    licensePlate:   v.licensePlate,
    vin:            v.vin,
    currentMileage: v.currentMileage,
    imageUrl:       v.imageUrl,
    notes:          v.notes,
    createdAt:      v.createdAt.toISOString(), // ✅ Date → string
    updatedAt:      v.updatedAt.toISOString(), // ✅ Date → string
  };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getVehiclesByUser(): Promise<ActionResult<SerializableVehicle[]>> {
  try {
    const user = await requireAuth();
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return ok(vehicles.map(serializeVehicle));
  } catch (error) {
    console.error("[getVehiclesByUser]", error);
    return fail("Error al obtener vehículos");
  }
}

export async function getVehicleById(
  vehicleId: string
): Promise<ActionResult<SerializableVehicle>> {
  try {
    const user = await requireAuth();
    // Ownership check via JOIN, nunca en memoria
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: user.id },
    });
    if (!vehicle) return fail("Vehículo no encontrado");
    return ok(serializeVehicle(vehicle));
  } catch (error) {
    console.error("[getVehicleById]", error);
    return fail("Error al obtener el vehículo");
  }
}

export async function createVehicle(
  formData: FormData
): Promise<ActionResult<SerializableVehicle>> {
  try {
    const user = await requireAuth();
    const raw = Object.fromEntries(formData.entries());
    const parsed = createVehicleSchema.safeParse(raw);

    if (!parsed.success) {
      return fail("Datos inválidos", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const vehicle = await prisma.vehicle.create({
      data: { ...parsed.data, userId: user.id },
    });
    return ok(serializeVehicle(vehicle));
  } catch (error) {
    console.error("[createVehicle]", error);
    return fail("Error al crear el vehículo");
  }
}

export async function updateVehicle(
  vehicleId: string,
  formData: FormData
): Promise<ActionResult<SerializableVehicle>> {
  try {
    const user = await requireAuth();
    // Ownership check via JOIN
    const existing = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: user.id },
    });
    if (!existing) return fail("Vehículo no encontrado");

    const raw = Object.fromEntries(formData.entries());
    const parsed = createVehicleSchema.safeParse(raw);

    if (!parsed.success) {
      return fail("Datos inválidos", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: parsed.data,
    });
    return ok(serializeVehicle(vehicle));
  } catch (error) {
    console.error("[updateVehicle]", error);
    return fail("Error al actualizar el vehículo");
  }
}

export async function deleteVehicle(
  vehicleId: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const user = await requireAuth();
    const existing = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: user.id },
    });
    if (!existing) return fail("Vehículo no encontrado");

    await prisma.vehicle.delete({ where: { id: vehicleId } });
    return ok({ deleted: true });
  } catch (error) {
    console.error("[deleteVehicle]", error);
    return fail("Error al eliminar el vehículo");
  }
}