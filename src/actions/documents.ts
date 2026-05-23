"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { uploadDocumentSchema, validateFile } from "@/lib/validations/document";
import { ok, fail } from "@/types/actions";
import type { ActionResult } from "@/types/actions";
import type { Document } from "@prisma/client";

// ---------------------------------------------------------------------------
// Tipos serializables (sin tipos de Prisma que no se pueden enviar al cliente)
// ---------------------------------------------------------------------------

export type SerializableDocument = Omit<Document, "createdAt" | "updatedAt" | "expiresAt"> & {
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
};

function serializeDocument(doc: Document): SerializableDocument {
  // Generamos la URL pública completa en el momento para que el frontend pueda abrirla
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(doc.url);

  return {
    ...doc,
    url: data.publicUrl, // Reemplazamos el path interno por la URL clickeable
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : null,
  };
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Genera una ruta única en el bucket siguiendo el patrón:
 * `{userId}/{vehicleId}/{timestamp}-{sanitizedName}.{ext}`
 *
 * Separar por userId y vehicleId facilita borrado masivo y organización.
 */
function buildStoragePath(userId: string, vehicleId: string, file: File): string {
  const timestamp = Date.now();
  const sanitizedName = file.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
  return `${userId}/${vehicleId}/${timestamp}-${sanitizedName}`;
}

/**
 * Obtiene la URL pública firmada (expira en 1 hora) de un archivo privado.
 * Usar solo para previsualización temporal — no almacenar esta URL en DB.
 */
export async function getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data) return null;
  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// uploadDocument
// ---------------------------------------------------------------------------

export async function uploadDocument(
  formData: FormData
): Promise<ActionResult<SerializableDocument>> {
  // 1. Auth
  const user = await requireAuth();

  // 2. Extraer y validar metadata
  const rawInput = {
    vehicleId: formData.get("vehicleId"),
    maintenanceRecordId: formData.get("maintenanceRecordId") || undefined,
    type: formData.get("type"),
    name: formData.get("name"),
    expiresAt: formData.get("expiresAt") || undefined,
  };

  const parsed = uploadDocumentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return fail("Datos inválidos", parsed.error.flatten().fieldErrors);
  }

  const { vehicleId, maintenanceRecordId, type, name, expiresAt } = parsed.data;

  // 3. Validar archivo
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Debes adjuntar un archivo");
  }

  const fileValidation = validateFile(file);
  if (!fileValidation.success) {
    return fail(fileValidation.error);
  }

  // 4. Ownership check — confirmar que el vehículo pertenece al usuario autenticado
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true },
  });

  if (!vehicle) {
    return fail("Vehículo no encontrado");
  }

  // 5. Si se especificó maintenanceRecordId, verificar que pertenece al vehículo
  if (maintenanceRecordId) {
    const maintenance = await prisma.maintenanceRecord.findFirst({
      where: { id: maintenanceRecordId, vehicleId },
      select: { id: true },
    });

    if (!maintenance) {
      return fail("Registro de mantenimiento no encontrado");
    }
  }

  // 6. Subir archivo a Supabase Storage
  const storagePath = buildStoragePath(user.id, vehicleId, file);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    console.error("[uploadDocument] Storage error:", storageError);
    return fail("Error al subir el archivo. Intenta de nuevo.");
  }

  // 7. Guardar registro en DB con el path (no la signed URL — esa es temporal)
  try {
    const document = await prisma.document.create({
      data: {
        vehicleId,
        maintenanceRecordId: maintenanceRecordId ?? null,
        type,
        name,
        url: storagePath, // Guardamos el path, no la URL firmada
        expiresAt: expiresAt ?? null,
      },
    });

    revalidatePath(`/dashboard/vehicles/${vehicleId}`);
    return ok(serializeDocument(document));
  } catch (dbError) {
    // Si falla la DB, limpiar el archivo ya subido para evitar huérfanos en Storage
    console.error("[uploadDocument] DB error:", dbError);
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return fail("Error al guardar el documento en la base de datos.");
  }
}

// ---------------------------------------------------------------------------
// getDocumentsByVehicle
// ---------------------------------------------------------------------------

export async function getDocumentsByVehicle(
  vehicleId: string
): Promise<ActionResult<SerializableDocument[]>> {
  const user = await requireAuth();

  // Ownership check via JOIN
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    select: { id: true },
  });

  if (!vehicle) {
    return fail("Vehículo no encontrado");
  }

  const documents = await prisma.document.findMany({
    where: { vehicleId },
    orderBy: { createdAt: "desc" },
  });

  return ok(documents.map(serializeDocument));
}

// ---------------------------------------------------------------------------
// deleteDocument
// ---------------------------------------------------------------------------

export async function deleteDocument(
  documentId: string
): Promise<ActionResult<{ deleted: true }>> {
  const user = await requireAuth();

  // Ownership check — JOIN hasta el vehículo del usuario
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      vehicle: { userId: user.id }, // ownership check vía relación
    },
    select: { id: true, url: true, vehicleId: true },
  });

  if (!document) {
    return fail("Documento no encontrado");
  }

  // 1. Eliminar archivo del Storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([document.url]);

  if (storageError) {
    // Log pero continuar — el registro de DB se elimina igual
    // El archivo huérfano puede limpiarse manualmente o con una Edge Function
    console.error("[deleteDocument] Storage error (continuando con DB):", storageError);
  }

  // 2. Eliminar registro de DB
  await prisma.document.delete({ where: { id: documentId } });

  revalidatePath(`/dashboard/vehicles/${document.vehicleId}`);
  return ok({ deleted: true });
}