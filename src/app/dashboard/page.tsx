import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getVehiclesByUser } from "@/actions/vehicles";
import { getExpired, getUpcoming } from "@/actions/reminders";
import { resetDemoData } from "@/actions/demo"; // <--- IMPORTACIÓN
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Car,
  Bell,
  AlertTriangle,
  Plus,
  ChevronRight,
  Wrench,
  Calendar,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function getGreeting(name: string | null | undefined): {
  greeting: string;
  sub: string;
} {
  const hour = new Date().getHours();
  const firstName = name && name.trim() !== "" ? name.split(" ")[0] : null;

  const time =
    hour < 12 ? "Buenos días" :
    hour < 18 ? "Buenas tardes" :
    "Buenas noches";

  const subByHour =
    hour < 12 ? "Revisá el estado de tus vehículos." :
    hour < 18 ? "Todo bajo control por acá." :
    "Un vistazo rápido antes de cerrar.";

  return {
    greeting: firstName ? `${time}, ${firstName}` : time,
    sub: subByHour,
  };
}

function formatMileage(km: number): string {
  return km.toLocaleString("es-AR") + " km";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Componentes de stats ──────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  variant?: "default" | "warning" | "danger" | "amber";
  href?: string;
}) {
  const variantStyles = {
    default: "text-foreground",
    warning: "text-warning",
    danger: "text-destructive",
    amber: "text-primary",
  };

  const iconBg = {
    default: "bg-secondary",
    warning: "bg-warning/10",
    danger: "bg-destructive/10",
    amber: "bg-primary/10",
  };

  const card = (
    <Card className="bg-card border-border hover:border-border/80 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p
              className={cn(
                "text-3xl font-display font-bold",
                variantStyles[variant],
              )}
            >
              {value}
            </p>
          </div>
          <div className={cn("p-2.5 rounded-lg", iconBg[variant])}>
            <Icon
              className={cn("w-5 h-5", variantStyles[variant])}
              strokeWidth={2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

/* ─── Vehicle card ──────────────────────────────────────────────────────── */

function VehicleCard({
  vehicle,
}: {
  vehicle: {
    id: string;
    nickname: string;
    brand: string;
    model: string;
    year: number;
    currentMileage: number;
  };
}) {
  return (
    <Link href={`/dashboard/vehicles/${vehicle.id}`}>
      <Card className="bg-card border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-200 group cursor-pointer">
        <CardContent className="p-4">
          {/* Ícono del auto */}
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Car className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </div>

          {/* Info */}
          <div>
            <p className="font-semibold text-foreground text-sm leading-tight">
              {vehicle.nickname}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {vehicle.brand} {vehicle.model} · {vehicle.year}
            </p>
          </div>

          {/* Kilometraje */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
            <Gauge className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">
              {formatMileage(vehicle.currentMileage)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ─── Reminder item ─────────────────────────────────────────────────────── */

function ReminderItem({
  reminder,
  type,
}: {
  reminder: {
    id: string;
    title: string;
    dueDate: string | null;
    dueMileage: number | null;
    status: string;
    vehicle: { nickname: string; brand: string; model: string };
  };
  type: "upcoming" | "expired";
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          type === "expired" ? "bg-destructive/10" : "bg-warning/10",
        )}
      >
        {type === "expired" ? (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        ) : (
          <Bell className="w-4 h-4 text-warning" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{reminder.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {reminder.vehicle.nickname} · {reminder.vehicle.brand}{" "}
          {reminder.vehicle.model}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          {reminder.dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatDate(reminder.dueDate)}
            </span>
          )}
          {reminder.dueMileage && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Gauge className="w-3 h-3" />
              {formatMileage(reminder.dueMileage)}
            </span>
          )}
        </div>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] shrink-0",
          type === "expired"
            ? "border-destructive/30 text-destructive bg-destructive/5"
            : "border-warning/30 text-warning bg-warning/5",
        )}
      >
        {type === "expired" ? "Vencido" : "Próximo"}
      </Badge>
    </div>
  );
}

/* ─── Empty states ──────────────────────────────────────────────────────── */

function EmptyVehicles() {
  return (
    <div className="col-span-full">
      <Card className="bg-card border-border border-dashed">
        <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <Car className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Sin vehículos todavía
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Agregá tu primer vehículo para empezar a registrar su
              mantenimiento.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="mt-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/dashboard/vehicles/new">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Agregar vehículo
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default async function DashboardPage() {
  // Obtenemos el perfil completo directamente desde Clerk
  const clerkUser = await currentUser();

  const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;

  // Log rápido para descartar errores de dedo
  console.log("DEBUG: Usuario intentando entrar:", userEmail);

  if (userEmail === "reclutadores9autolog@gmail.com") {
    console.log("DEBUG: Reseteando datos demo...");
    await resetDemoData();
  }

  const displayName = clerkUser?.firstName;

  // Fetch en paralelo de los datos
  const [vehiclesResult, expiredResult, upcomingResult] = await Promise.all([
    getVehiclesByUser(),
    getExpired(),
    getUpcoming(),
  ]);

  const vehicles = vehiclesResult.success ? vehiclesResult.data : [];
  const expired = expiredResult.success ? expiredResult.data : [];
  const upcoming = upcomingResult.success ? upcomingResult.data : [];

  // Pasamos el nombre extraído de Clerk al saludo
  const { greeting, sub } = getGreeting(displayName);

  // Últimos 4 vehículos para la preview
  const recentVehicles = vehicles.slice(0, 4);

  // Máximo 5 alertas para el dashboard (mezcla vencidos + próximos)
  const allAlerts = [
    ...expired.map((r) => ({ ...r, alertType: "expired" as const })),
    ...upcoming.map((r) => ({ ...r, alertType: "upcoming" as const })),
  ].slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {greeting}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{sub}</p>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/dashboard/vehicles/new">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Vehículo
          </Link>
        </Button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger">
        <div className="animate-fade-up">
          <StatCard
            label="Mis vehículos"
            value={vehicles.length}
            icon={Car}
            variant="amber"
            href="/dashboard/vehicles"
          />
        </div>
        <div className="animate-fade-up">
          <StatCard
            label="Próximos"
            value={upcoming.length}
            icon={Bell}
            variant="warning"
            href="/dashboard/reminders"
          />
        </div>
        <div className="animate-fade-up col-span-2 md:col-span-1">
          <StatCard
            label="Vencidos"
            value={expired.length}
            icon={AlertTriangle}
            variant={expired.length > 0 ? "danger" : "default"}
            href="/dashboard/reminders"
          />
        </div>
      </div>

      {/* ── Vehículos recientes ──────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-base font-semibold text-foreground">
              Mis Vehículos
            </h2>
          </div>
          {vehicles.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-muted-foreground"
            >
              <Link href="/dashboard/vehicles">
                Ver todos
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {recentVehicles.length === 0 ? (
            <EmptyVehicles />
          ) : (
            recentVehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)
          )}
        </div>
      </section>

      {/* ── Alertas activas ─────────────────────────────────────────────── */}
      {allAlerts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-display text-base font-semibold text-foreground">
                Alertas activas
              </h2>
              <Badge
                variant="outline"
                className="text-[10px] border-warning/30 text-warning bg-warning/5"
              >
                {allAlerts.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-muted-foreground"
            >
              <Link href="/dashboard/reminders">
                Ver todas
                <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="px-4 py-1 divide-y divide-border/40">
              {allAlerts.map((alert) => (
                <ReminderItem
                  key={alert.id}
                  reminder={alert}
                  type={alert.alertType}
                />
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Empty state global (sin vehículos ni alertas) ───────────────── */}
      {vehicles.length === 0 && allAlerts.length === 0 && (
        <div className="py-12 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center rotate-3">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="max-w-sm">
            <p className="font-display text-lg font-semibold text-foreground">
              Empezá a registrar tu flota
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Agregá tus vehículos y AutoLog Pro se encarga de recordarte cada
              mantenimiento automáticamente.
            </p>
          </div>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/dashboard/vehicles/new">
              <Plus className="w-4 h-4 mr-2" />
              Agregar mi primer vehículo
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
