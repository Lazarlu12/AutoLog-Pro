"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/actions/documents";
import { DOCUMENT_TYPE_LABELS } from "@/types/domain";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Upload, FileText } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────
interface UploadDocumentFormProps {
  vehicleId: string;
  /** Si se pasa, el doc queda vinculado a ese registro de mantenimiento */
  maintenanceRecordId?: string;
  /** Callback opcional al completar la subida (para cerrar un dialog, etc.) */
  onSuccess?: () => void;
}

// ─── Helper: mensaje de error por campo ───────────────────────────────────────
function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="flex items-center gap-1 text-sm text-red-400 mt-1">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {errors[0]}
    </p>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function UploadDocumentForm({
  vehicleId,
  maintenanceRecordId,
  onSuccess,
}: UploadDocumentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Vista previa del archivo seleccionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estado de errores
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function clearErrors() {
    setFieldErrors({});
    setGeneralError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    // Limpiar error de archivo al seleccionar uno nuevo
    if (file) setFieldErrors((prev) => ({ ...prev, file: [] }));
  }

  function handleSubmit(formData: FormData) {
    clearErrors();
    // Inyectar el vehicleId y maintenanceRecordId que no están en el form HTML
    formData.set("vehicleId", vehicleId);
    if (maintenanceRecordId) formData.set("maintenanceRecordId", maintenanceRecordId);

    startTransition(async () => {
      const result = await uploadDocument(formData);

      if (!result.success) {
        setGeneralError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        
        if (!result.fieldErrors) {
          toast.error(result.error || "Ocurrió un error inesperado");
        }
        return;
      }

      // Limpiar formulario
      formRef.current?.reset();
      setSelectedFile(null);

      // Toast de éxito
      toast.success("Documento subido correctamente");

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir documento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">

          {/* ── Error general ── */}
          {generalError && !Object.keys(fieldErrors).length && (
            <div className="flex items-center gap-2 rounded-md border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {generalError}
            </div>
          )}

          {/* ── Tipo de documento ── */}
          <div className="space-y-1">
            <Label htmlFor="type">Tipo de documento *</Label>
            <Select name="type" required>
              <SelectTrigger
                className={fieldErrors.type ? "border-red-500 focus:ring-red-500" : ""}
              >
                <SelectValue placeholder="Seleccioná el tipo…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={fieldErrors.type} />
          </div>

          {/* ── Nombre del documento ── */}
          <div className="space-y-1">
            <Label htmlFor="name">Nombre del documento *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Póliza de seguro 2024, Tarjeta verde…"
              required
              aria-invalid={!!fieldErrors.name}
              className={fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            <FieldError errors={fieldErrors.name} />
          </div>

          {/* ── Fecha de vencimiento ── */}
          <div className="space-y-1">
            <Label htmlFor="expiresAt">Fecha de vencimiento</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              aria-invalid={!!fieldErrors.expiresAt}
              className={fieldErrors.expiresAt ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            <FieldError errors={fieldErrors.expiresAt} />
          </div>

          {/* ── Archivo ── */}
          <div className="space-y-1">
            <Label htmlFor="file">Archivo *</Label>
            <div
              className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors
                ${fieldErrors.file
                  ? "border-red-500 bg-red-950/20"
                  : "border-zinc-700 bg-zinc-900/50 hover:border-amber-500/50 hover:bg-zinc-800/50"
                }`}
            >
              {selectedFile ? (
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <FileText className="h-5 w-5 text-amber-400" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-zinc-500">
                    ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-zinc-500" />
                  <p className="text-sm text-zinc-400">
                    Hacé clic o arrastrá un archivo aquí
                  </p>
                  <p className="text-xs text-zinc-600">PDF, JPG, PNG — máx. 10 MB</p>
                </>
              )}
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                required
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
            <FieldError errors={fieldErrors.file} />
          </div>

          {/* ── Acciones ── */}
          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={isPending} className="gap-2">
              <Upload className="h-4 w-4" />
              {isPending ? "Subiendo…" : "Subir documento"}
            </Button>
            {onSuccess && (
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                disabled={isPending}
              >
                Cancelar
              </Button>
            )}
          </div>

        </form>
      </CardContent>
    </Card>
  );
}