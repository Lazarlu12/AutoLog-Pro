"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  AlertTriangle,
  Calendar,
  Gauge,
  Car,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dismiss } from "@/actions/reminders";
import type { ReminderWithVehicle } from "@/types/domain";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMileage(km: number) {
  return km.toLocaleString("es-AR") + " km";
}

/* ─── Single reminder card ───────────────────────────────────────────────── */

function ReminderCard({
  reminder,
  type,
  onDismiss,
}: {
  reminder: ReminderWithVehicle;
  type: "expired" | "upcoming";
  onDismiss: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDismiss() {
    startTransition(async () => {
      await dismiss(reminder.id);
      onDismiss(reminder.id);
    });
  }

  const isExpired = type === "expired";

  return (
    <div className={cn(
      "flex items-start gap-4 py-4 border-b border-border/40 last:border-0",
      "group transition-opacity",
      isPending && "opacity-50 pointer-events-none"
    )}>
      {/* Ícono */}
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
        isExpired ? "bg-destructive/10" : "bg-warning/10"
      )}>
        {isExpired
          ? <AlertTriangle className="w-4 h-4 text-destructive" />
          : <Bell className="w-4 h-4 text-warning" />
        }
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground leading-snug">
            {reminder.title}
          </p>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] shrink-0 mt-0.5",
              isExpired
                ? "border-destructive/30 text-destructive bg-destructive/5"
                : "border-warning/30 text-warning bg-warning/5"
            )}
          >
            {isExpired ? "Vencido" : reminder.status === "SENT" ? "Por km" : "Próximo"}
          </Badge>
        </div>

        {/* Vehículo */}
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
          <Car className="w-3 h-3" />
          {reminder.vehicle.nickname} · {reminder.vehicle.brand} {reminder.vehicle.model}
        </p>

        {/* Fecha y kilometraje */}
        <div className="flex items-center gap-4 mt-2">
          {reminder.dueDate && (
            <span className={cn(
              "flex items-center gap-1 text-xs",
              isExpired ? "text-destructive" : "text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3" />
              {formatDate(reminder.dueDate)}
            </span>
          )}
          {reminder.dueMileage && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Gauge className="w-3 h-3" />
              {formatMileage(reminder.dueMileage)}
              {" · "}
              <span className="text-foreground/60">
                actual: {formatMileage(reminder.vehicle.currentMileage)}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Botón descartar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        disabled={isPending}
        className="shrink-0 h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
        title="Descartar recordatorio"
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <>
            <Check className="w-3 h-3 mr-1" />
            Listo
          </>
        )}
      </Button>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

interface RemindersListProps {
  expired: ReminderWithVehicle[];
  upcoming: ReminderWithVehicle[];
}

export function RemindersList({ expired: initialExpired, upcoming: initialUpcoming }: RemindersListProps) {
  // UI optimista: removemos el item localmente al descartar
  const [expired, setExpired] = useState<ReminderWithVehicle[]>(initialExpired);
  const [upcoming, setUpcoming] = useState<ReminderWithVehicle[]>(initialUpcoming);

  function handleDismiss(id: string) {
    setExpired((prev) => prev.filter((r) => r.id !== id));
    setUpcoming((prev) => prev.filter((r) => r.id !== id));
  }

  const totalActive = expired.length + upcoming.length;

  /* Estado vacío */
  if (totalActive === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center">
          <Check className="w-7 h-7 text-success" />
        </div>
        <div>
          <p className="font-display font-semibold text-foreground">Todo al día</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            No tenés recordatorios pendientes. Registrá un mantenimiento con fecha límite para generar uno.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Vencidos ──────────────────────────────────────────────────── */}
      {expired.length > 0 && (
        <Card className="bg-card border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Vencidos
              <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive bg-destructive/5">
                {expired.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-1">
            {expired.map((reminder: ReminderWithVehicle) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                type="expired"
                onDismiss={handleDismiss}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Próximos ──────────────────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-warning" />
              Próximos
              <Badge variant="outline" className="text-[10px] border-warning/30 text-warning bg-warning/5">
                {upcoming.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-1">
            {upcoming.map((reminder: ReminderWithVehicle) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                type="upcoming"
                onDismiss={handleDismiss}
              />
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  );
}