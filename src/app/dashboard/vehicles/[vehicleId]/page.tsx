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
  SerializableVehicle,
  SerializableMaintenanceRecord,
  SerializableDocument,
  ReminderWithVehicle,
} from "@/types/domain";

interface VehiclePageProps {
  params: Promise<{ vehicleId: string }>;
}

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { vehicleId } = await params;
  const result = await getVehicleById(vehicleId);
  if (!result.success) return { title: "Vehículo" };
  return { title: `${result.data.nickname} — ${result.data.brand} ${result.data.model}` };
}

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
      <DeleteDocumentButton documentId={doc.id} documentName={doc.name} />
    </div>
  );
}

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

  const vehicle = vehicleResult.data;
  const records: SerializableMaintenanceRecord[] = maintenanceResult.success ? maintenanceResult.data : [];
  const documents: SerializableDocument[] = documentsResult.success ? documentsResult.data : [];
  const reminders: ReminderWithVehicle[] = remindersResult.success ? remindersResult.data : [];

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

      {/* ── Grid Resumen Técnico ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Kilometraje", value: formatMileage(vehicle.currentMileage), icon: Gauge },
          { label: "Año", value: String(vehicle.year), icon: Calendar },
          { label: "Patente", value: vehicle.licensePlate ?? "—", icon: Hash },
          { label: "Servicios", value: String(records.length), icon: Wrench },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-foreground text-sm uppercase">{value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Alertas activas de recordatorios ── */}
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

      {/* ── Distribución en Columnas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Timeline de Mantenimientos (2/3) */}
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
            <CardContent className="px-5 py-2">
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
                /* Eje de la línea de tiempo vertical */
                <div className="relative border-l border-border ml-3 my-3 space-y-6">
                  {records.map((record) => (
                    <div key={record.id} className="relative pl-6 group">
                      
                      {/* Nodo estético */}
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-950 border border-primary ring-4 ring-zinc-950 transition-transform group-hover:scale-110" />

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-zinc-900/10 group-hover:bg-zinc-900/30 p-3.5 rounded-lg border border-transparent hover:border-border/60 transition-all">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">
                              {MAINTENANCE_TYPE_LABELS[record.type]}
                            </span>
                            {record.provider && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="w-3 h-3 text-zinc-500" /> {record.provider}
                              </span>
                            )}
                          </div>
                          
                          {record.notes && (
                            <p className="text-sm text-zinc-300 break-words leading-relaxed">
                              {record.notes}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                              {formatDate(record.serviceDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Gauge className="h-3.5 w-3.5 text-zinc-600" />
                              {formatMileage(record.mileage)}
                            </span>
                            {record.cost !== null && (
                              <span className="flex items-center gap-0.5 font-medium text-emerald-400">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                                {formatCurrency(record.cost)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Próximo vencimiento si aplica */}
                        {(record.nextDueDate || record.nextDueMileage) && (
                          <div className="shrink-0 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40 mt-1 sm:mt-0">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Próximo</p>
                            {record.nextDueDate && (
                              <p className="text-xs text-warning font-medium mt-0.5">{formatDate(record.nextDueDate)}</p>
                            )}
                            {record.nextDueMileage && (
                              <p className="text-xs text-muted-foreground mt-0.5">{formatMileage(record.nextDueMileage)}</p>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: Documentos y notas (1/3) */}
        <div className="space-y-4">
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

          <UploadDocumentForm vehicleId={vehicleId} />

          {vehicle.notes && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Notas</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{vehicle.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}