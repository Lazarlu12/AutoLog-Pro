"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { requireAuth } from "@/src/lib/auth";
import { ok, fail } from "@/src/types/actions";
import type { ActionResult } from "@/src/types/actions";
import type { Reminder } from "@prisma/client";

// ---------------------------------------------------------------------------
// Tipos serializables
// ---------------------------------------------------------------------------

/**
 * Reminder con el vehículo al que pertenece.
 * Se incluye vehicle para que la UI pueda mostrar
 * "Próximo cambio de aceite — Toyota Corolla" sin hacer otra query.
 */
export type ReminderWithVehicle = Omit<
  Reminder,
  "createdAt" | "updatedAt" | "dueDate" | "notifiedAt"
> & {
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  notifiedAt: string | null;
  vehicle: {
    nickname: string;
    brand: string;
    model: string;
    currentMileage: number;
  };
};

function serializeReminder(
  reminder: Reminder & {
    vehicle: { nickname: string; brand: string; model: string; currentMileage: number };
  }
): ReminderWithVehicle {
  return {
    ...reminder,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString(),
    dueDate: reminder.dueDate ? reminder.dueDate.toISOString() : null,
    notifiedAt: reminder.notifiedAt ? reminder.notifiedAt.toISOString() : null,
  };
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Ventana de "próximo a vencer" en días para recordatorios por fecha. */
const UPCOMING_DAYS_WINDOW = 30;

// ---------------------------------------------------------------------------
// getUpcoming
// ---------------------------------------------------------------------------

/**
 * Trae los recordatorios que necesitan atención próximamente.
 *
 * Incluye:
 *  - PENDING con dueDate dentro de los próximos 30 días
 *  - PENDING con dueMileage definido y sin dueDate (siempre visibles hasta que el
 *    trigger los marque SENT o el usuario los descarte)
 *  - SENT (ya disparados por el trigger de kilometraje — esperando al usuario)
 *
 * @param vehicleId  Opcional. Si se pasa, filtra solo ese vehículo.
 */
export async function getUpcoming(
  vehicleId?: string
): Promise<ActionResult<ReminderWithVehicle[]>> {
  const user = await requireAuth();

  const now = new Date();
  const windowEnd = new Date(now.getTime() + UPCOMING_DAYS_WINDOW * 24 * 60 * 60 * 1000);

  const reminders = await prisma.reminder.findMany({
    where: {
      // Ownership check siempre via JOIN — nunca en memoria
      vehicle: { userId: user.id },

      // Filtro opcional por vehículo
      ...(vehicleId ? { vehicleId } : {}),

      // Solo recordatorios activos (no descartados)
      status: { in: ["PENDING", "SENT"] },

      // Al menos una de estas condiciones debe cumplirse:
      OR: [
        // 1. Vence por fecha dentro de la ventana
        {
          dueDate: {
            gte: now,
            lte: windowEnd,
          },
        },
        // 2. Ya fue disparado por el trigger de kilometraje
        {
          status: "SENT",
        },
        // 3. Tiene dueMileage pero sin fecha — siempre se muestra hasta que se resuelva
        {
          dueDate: null,
          dueMileage: { not: null },
        },
      ],
    },
    orderBy: [
      // SENT primero (ya vencidos por km), luego PENDING
      { status: "asc" },
      // Dentro de cada grupo, el más próximo a vencer primero
      { dueDate: "asc" },
    ],
    include: {
      vehicle: {
        select: {
          nickname: true,
          brand: true,
          model: true,
          currentMileage: true,
        },
      },
    },
  });

  return ok(reminders.map(serializeReminder));
}

// ---------------------------------------------------------------------------
// getExpired
// ---------------------------------------------------------------------------

/**
 * Trae los recordatorios que ya vencieron por fecha y no fueron atendidos.
 *
 * Un recordatorio "vencido" es aquel donde dueDate < ahora y el usuario
 * nunca lo descartó. Sirve para mostrar una alerta de "acción pendiente".
 *
 * Nota: los vencidos por kilometraje los maneja el trigger (pasan a SENT),
 * por eso getExpired solo evalúa dueDate.
 *
 * @param vehicleId  Opcional. Si se pasa, filtra solo ese vehículo.
 */
export async function getExpired(
  vehicleId?: string
): Promise<ActionResult<ReminderWithVehicle[]>> {
  const user = await requireAuth();

  const now = new Date();

  const reminders = await prisma.reminder.findMany({
    where: {
      vehicle: { userId: user.id },
      ...(vehicleId ? { vehicleId } : {}),
      status: { in: ["PENDING", "SENT"] },
      dueDate: { lt: now }, // Fecha de vencimiento ya pasó
    },
    orderBy: {
      // El más vencido primero — el usuario ve lo más urgente arriba
      dueDate: "asc",
    },
    include: {
      vehicle: {
        select: {
          nickname: true,
          brand: true,
          model: true,
          currentMileage: true,
        },
      },
    },
  });

  return ok(reminders.map(serializeReminder));
}

// ---------------------------------------------------------------------------
// dismiss
// ---------------------------------------------------------------------------

/**
 * Marca un recordatorio como DISMISSED.
 *
 * El ownership check verifica que el recordatorio pertenece a un vehículo
 * del usuario autenticado — mismo patrón que deleteDocument.
 */
export async function dismiss(
  reminderId: string
): Promise<ActionResult<{ dismissed: true }>> {
  // Validación básica del ID
  if (!reminderId || typeof reminderId !== "string" || reminderId.trim() === "") {
    return fail("ID de recordatorio inválido");
  }

  const user = await requireAuth();

  // Buscar con ownership check — si no existe o no es del usuario, findFirst retorna null
  const reminder = await prisma.reminder.findFirst({
    where: {
      id: reminderId,
      vehicle: { userId: user.id }, // ownership check via JOIN
    },
    select: { id: true, vehicleId: true, status: true },
  });

  if (!reminder) {
    return fail("Recordatorio no encontrado");
  }

  // Idempotente: si ya fue descartado, no es un error
  if (reminder.status === "DISMISSED") {
    return ok({ dismissed: true });
  }

  await prisma.reminder.update({
    where: { id: reminderId },
    data: { status: "DISMISSED" },
  });

  // Revalidar la página del vehículo y el dashboard
  revalidatePath(`/dashboard/vehicles/${reminder.vehicleId}`);
  revalidatePath("/dashboard");

  return ok({ dismissed: true });
}

// ---------------------------------------------------------------------------
// getPendingCount  (bonus — útil para el badge del dashboard)
// ---------------------------------------------------------------------------

/**
 * Retorna la cantidad total de recordatorios activos del usuario.
 * Suma upcoming + expired — ideal para un badge "3 alertas pendientes".
 *
 * No incluye vehicleId como filtro porque el dashboard lo necesita global.
 */
export async function getPendingCount(): Promise<ActionResult<{ count: number }>> {
  const user = await requireAuth();

  const count = await prisma.reminder.count({
    where: {
      vehicle: { userId: user.id },
      status: { in: ["PENDING", "SENT"] },
    },
  });

  return ok({ count });
}