import { notFound } from "next/navigation";
import Link from "next/link";
import { getVehicleById } from "@/actions/vehicles";
import { getMaintenanceByVehicle } from "@/actions/maintenance";
import { getDocumentsByVehicle } from "@/actions/documents";
import { getUpcoming } from "@/actions/reminders";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UploadDocumentForm } from "@/components/forms/UploadDocumentForm";
import { DeleteDocumentButton } from "@/components/vehicles/DeleteDocumentButton";
import {
  Wrench,
  FileText,
  Bell,
  Plus,
  Gauge,
  Calendar,
  DollarSign,
  ChevronRight,
  AlertTriangle,
  Hash,
  User,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAINTENANCE_TYPE_LABELS, DOCUMENT_TYPE_LABELS } from "@/types/domain";
import type { Metadata } from "next";
import type {
  SerializableMaintenanceRecord,
  SerializableDocument,
  ReminderWithVehicle,
} from "@/types/domain";

/* ─── Tipos de params en App Router ─────────────────────────────────────── */

interface VehiclePageProps {
  params: Promise<{ vehicleId: string }>;
}

/* ─── Metadata dinámica ──────────────────────────────────────────────────── */

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { vehicleId } = await params;
  const result = await getVehicleById(vehicleId);
  if (!result.success) return { title: "Vehículo" };
  return { title: `${result.data.nickname} — ${result.data.brand} ${result.data.model}` };
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatMileage(km: number) {
  return km.toLocaleString("es-AR") + " km";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number | null) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ─── Maintenance row ────────────────────────────────────────────────────── */

function MaintenanceRow({ record }: { record: SerializableMaintenanceRecord }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border/40 last:border-0 group">
      <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/10 transition-colors">
        <Wrench className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {MAINTENANCE_TYPE_LABELS[record.type]}
          </span>
          {record.provider && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" /> {record.provider}
            </span>
          )}
        </div>
        {record.notes && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{record.notes}</p>
        )}
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" /> {formatDate(record.serviceDate)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Gauge className="w-3 h-3" /> {formatMileage(record.mileage)}
          </span>
          {record.cost !== null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3" /> {formatCurrency(record.cost)}
            </span>
          )}
        </div>
      </div>
      {/* Próximo servicio */}
      {(record.nextDueDate || record.nextDueMileage) && (
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Próximo</p>
          {record.nextDueDate && (
            <p className="text-xs text-warning mt-0.5">{formatDate(record.nextDueDate)}</p>
          )}
          {record.nextDueMileage && (
            <p className="text-xs text-muted-foreground mt-0.5">{formatMileage(record.nextDueMileage)}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Document row ───────────────────────────────────────────────────────── */
// ↓ Ahora recibe vehicleId para que DeleteDocumentButton pueda hacer refresh
// sin necesidad de prop-drilling adicional.

function DocumentRow({ doc }: { doc: SerializableDocument }) {
  const isExpiringSoon = doc.expiresAt
    ? new Date(doc.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;

  const isExpired = doc.expiresAt ? new Date(doc.expiresAt) < new Date() : false;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
        <p className="text-xs text-muted-foreground">{DOCUMENT_TYPE_LABELS[doc.type]}</p>
      </div>
      {doc.expiresAt && (
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] shrink-0",
            isExpired
              ? "border-destructive/30 text-destructive bg-destructive/5"
              : isExpiringSoon
              ? "border-warning/30 text-warning bg-warning/5"
              : "border-border text-muted-foreground"
          )}
        >
          {isExpired ? "Vencido" : formatDate(doc.expiresAt)}
        </Badge>
      )}
      {/* ── Botón eliminar documento ── */}
      <DeleteDocumentButton documentId={doc.id} documentName={doc.name} />
    </div>
  );
}

/* ─── Reminder item ──────────────────────────────────────────────────────── */

function ReminderItem({ reminder }: { reminder: ReminderWithVehicle }) {
  const isExpired = reminder.dueDate
    ? new Date(reminder.dueDate) < new Date()
    : false;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        isExpired || reminder.status === "SENT" ? "bg-warning/10" : "bg-secondary"
      )}>
        <Bell className={cn(
          "w-3.5 h-3.5",
          isExpired || reminder.status === "SENT" ? "text-warning" : "text-muted-foreground"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{reminder.title}</p>
        <div className="flex items-center gap-3 mt-1">
          {reminder.dueDate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(reminder.dueDate)}
            </span>
          )}
          {reminder.dueMileage && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Gauge className="w-3 h-3" /> {formatMileage(reminder.dueMileage)}
            </span>
          )}
        </div>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] shrink-0",
          isExpired || reminder.status === "SENT"
            ? "border-warning/30 text-warning bg-warning/5"
            : "border-border text-muted-foreground"
        )}
      >
        {isExpired ? "Vencido" : reminder.status === "SENT" ? "Activo" : "Pendiente"}
      </Badge>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const { vehicleId } = await params;

  const [vehicleResult, maintenanceResult, documentsResult, remindersResult] =
    await Promise.all([
      getVehicleById(vehicleId),
      getMaintenanceByVehicle(vehicleId),
      getDocumentsByVehicle(vehicleId),
      getUpcoming(vehicleId),
    ]);

  if (!vehicleResult.success) notFound();

  const vehicle    = vehicleResult.data;
  const records: SerializableMaintenanceRecord[]  = maintenanceResult.success ? maintenanceResult.data : [];
  const documents: SerializableDocument[]         = documentsResult.success   ? documentsResult.data  : [];
  const reminders: ReminderWithVehicle[]          = remindersResult.success   ? remindersResult.data  : [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title={vehicle.nickname}
        description={`${vehicle.brand} ${vehicle.model} · ${vehicle.year}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Mis Vehículos", href: "/dashboard/vehicles" },
        ]}
        action={{
          label: "Editar",
          href: `/dashboard/vehicles/${vehicleId}/edit`,
          icon: Pencil,
          variant: "outline",
        }}
      />

      {/* ── Info del vehículo ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Kilometraje", value: formatMileage(vehicle.currentMileage), icon: Gauge },
          { label: "Año",         value: String(vehicle.year),                  icon: Calendar },
          { label: "Patente",     value: vehicle.licensePlate ?? "—",           icon: Hash },
          { label: "Servicios",   value: String(records.length),                icon: Wrench },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-foreground text-sm">{value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Alertas activas ──────────────────────────────────────────── */}
      {reminders.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-warning/20 bg-warning/5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {reminders.length} recordatorio{reminders.length !== 1 ? "s" : ""} activo{reminders.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Revisá la sección de recordatorios para más detalle.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 border-warning/30 text-warning hover:bg-warning/10">
            <Link href="/dashboard/reminders">Ver <ChevronRight className="w-3 h-3 ml-1" /></Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Historial de mantenimiento (2/3) ─────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                Historial de mantenimiento
                <Badge variant="secondary" className="text-[10px] font-medium">{records.length}</Badge>
              </CardTitle>
              <Button asChild size="sm" variant="outline" className="text-xs h-7 px-2.5">
                <Link href={`/dashboard/vehicles/${vehicleId}/maintenance/new`}>
                  <Plus className="w-3 h-3 mr-1" /> Registrar
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-5 py-1">
              {records.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">Sin registros todavía.</p>
                  <Button asChild size="sm" variant="ghost" className="mt-2 text-primary hover:text-primary hover:bg-primary/10">
                    <Link href={`/dashboard/vehicles/${vehicleId}/maintenance/new`}>
                      Registrar primer mantenimiento
                    </Link>
                  </Button>
                </div>
              ) : (
                records.map((record: SerializableMaintenanceRecord) => (
                  <MaintenanceRow key={record.id} record={record} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Columna lateral (1/3) ─────────────────────────────────── */}
        <div className="space-y-4">

          {/* ── Documentos ── */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Documentos
                <Badge variant="secondary" className="text-[10px]">{documents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-1">
              {documents.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground text-center">Sin documentos.</p>
              ) : (
                documents.map((doc: SerializableDocument) => (
                  <DocumentRow key={doc.id} doc={doc} />
                ))
              )}
            </CardContent>
          </Card>

          {/* ── Subir documento ── */}
          {/*
            UploadDocumentForm es un Client Component que vive dentro de
            este Server Component. Next.js App Router lo permite sin problemas.
            No necesita onSuccess: al completar llama router.refresh() internamente.
          */}
          <UploadDocumentForm vehicleId={vehicleId} />

          {/* ── Notas del vehículo ── */}
          {vehicle.notes && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Notas</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{vehicle.notes}</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}