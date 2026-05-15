/**
 * src/types/domain.ts
 *
 * Fuente única de verdad para todos los tipos del proyecto.
 * Las páginas y componentes importan desde aquí, nunca definen tipos propios.
 *
 * Patrón:
 *  - "Serializable*" = tipo Prisma con Date → string (safe para Server → Client)
 *  - Los enums se reexportan desde Prisma para no duplicarlos
 */

import type {
  DocumentType,
  MaintenanceType,
  ReminderStatus,
} from "@prisma/client";

// Reexportar enums para que los componentes no importen de @prisma/client directamente
export type { DocumentType, MaintenanceType, ReminderStatus };

/* ─── Vehicle ────────────────────────────────────────────────────────────── */

export interface SerializableVehicle {
  id: string;
  userId: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string | null;
  vin: string | null;
  currentMileage: number;
  imageUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── MaintenanceRecord ──────────────────────────────────────────────────── */

export interface SerializableMaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  serviceDate: string;
  mileage: number;
  cost: number | null;
  provider: string | null;
  notes: string | null;
  nextDueDate: string | null;
  nextDueMileage: number | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Document ───────────────────────────────────────────────────────────── */

export interface SerializableDocument {
  id: string;
  vehicleId: string;
  maintenanceRecordId: string | null;
  type: DocumentType;
  name: string;
  url: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ─── Reminder ───────────────────────────────────────────────────────────── */

export interface ReminderWithVehicle {
  id: string;
  vehicleId: string;
  maintenanceRecordId: string | null;
  title: string;
  dueDate: string | null;
  dueMileage: number | null;
  status: ReminderStatus;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    nickname: string;
    brand: string;
    model: string;
    currentMileage: number;
  };
}

/* ─── UI helpers ─────────────────────────────────────────────────────────── */

/** Para los items de features en la landing y otras listas estáticas con íconos */
import type { LucideIcon } from "lucide-react";
export type { LucideIcon };

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/** Labels legibles para los enums — usados en badges y selects */
export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  OIL_CHANGE:  "Cambio de aceite",
  BRAKES:      "Frenos",
  TIRES:       "Neumáticos",
  BATTERY:     "Batería",
  FILTERS:     "Filtros",
  ALIGNMENT:   "Alineación",
  INSPECTION:  "Inspección",
  INSURANCE:   "Seguro",
  OTHER:       "Otro",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  INSURANCE:    "Seguro",
  REGISTRATION: "Patente / Registro",
  INSPECTION:   "VTV / Inspección",
  MANUAL:       "Manual",
  RECEIPT:      "Comprobante",
  OTHER:        "Otro",
};

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  PENDING:   "Pendiente",
  SENT:      "Enviado",
  DISMISSED: "Descartado",
};