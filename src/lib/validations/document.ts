import { z } from "zod";
import { DocumentType } from "@prisma/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/**
 * Schema para subir un documento.
 * El archivo (File) se valida por separado ya que Zod no maneja File nativamente.
 */
export const uploadDocumentSchema = z.object({
  vehicleId: z.string().cuid("ID de vehículo inválido"),

  // Opcional: asociar el documento a un mantenimiento específico
  maintenanceRecordId: z.string().cuid("ID de mantenimiento inválido").optional(),

type: z.nativeEnum(DocumentType, {
   error: () => "Tipo de documento inválido",
}),
  
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar 100 caracteres")
    .trim(),

  // Fecha de vencimiento — clave para recordatorios en Fase 5
  expiresAt: z
    .string()
    .datetime({ message: "Fecha de vencimiento inválida" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" || val === undefined ? undefined : new Date(val))),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

/**
 * Validación manual del archivo (File).
 * Se llama por separado en la Server Action.
 */
export function validateFile(file: File): { success: true } | { success: false; error: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `El archivo supera el límite de 10 MB (tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      success: false,
      error: `Tipo de archivo no permitido. Se aceptan: PDF, JPEG, PNG, WEBP`,
    };
  }

  return { success: true };
}