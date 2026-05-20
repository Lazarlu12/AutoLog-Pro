"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";

/* ─── Tipos ─────────────────────────────────────────────────────────────── */

interface SidebarProps {
  pendingCount: number;
  user: {
    name: string;
    email: string;
    imageUrl: string | null;
  };
}

/* ─── Ítems de navegación ───────────────────────────────────────────────── */

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    // exact: solo activo si la ruta ES exactamente /dashboard
    exact: true,
  },
  {
    href: "/dashboard/vehicles",
    label: "Mis Vehículos",
    icon: Car,
    exact: false,
  },
  {
    href: "/dashboard/reminders",
    label: "Recordatorios",
    icon: Bell,
    exact: false,
    badge: true, // muestra el contador de pendientes
  },
] as const;

/* ─── Logo ──────────────────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 group">
      {/* Ícono hexagonal estilo tablero de instrumentos */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 rounded-lg rotate-45 group-hover:bg-primary/30 transition-colors" />
        <Car className="relative w-4 h-4 text-primary" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display font-700 text-sm tracking-tight text-foreground">
          AutoLog
        </span>
        <span className="text-[10px] font-medium text-primary tracking-widest uppercase">
          Pro
        </span>
      </div>
    </Link>
  );
}

/* ─── Nav item ──────────────────────────────────────────────────────────── */

function NavItem({
  item,
  pendingCount,
  onClick,
}: {
  item: (typeof navItems)[number];
  pendingCount: number;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium",
        "transition-all duration-150 group relative",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {/* Indicador lateral activo */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}

      <item.icon
        className={cn(
          "w-4 h-4 shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
        strokeWidth={isActive ? 2.5 : 2}
      />

      <span className="flex-1">{item.label}</span>

      {/* Badge de recordatorios pendientes */}
      {"badge" in item && item.badge && pendingCount > 0 && (
        <Badge
          variant="default"
          className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-primary text-primary-foreground"
        >
          {pendingCount > 99 ? "99+" : pendingCount}
        </Badge>
      )}

      {isActive && (
        <ChevronRight className="w-3 h-3 text-primary/60 ml-auto" />
      )}
    </Link>
  );
}

/* ─── Contenido del sidebar ─────────────────────────────────────────────── */

function SidebarContent({
  pendingCount,
  user,
  onNavClick,
}: SidebarProps & { onNavClick?: () => void }) {
  const { signOut } = useClerk();

  // Iniciales para el avatar fallback
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5">
        <Logo />
      </div>

      <Separator className="bg-border/60" />

      {/* Navegación principal */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            pendingCount={pendingCount}
            onClick={onNavClick}
          />
        ))}
      </nav>

      <Separator className="bg-border/60" />

      {/* Usuario y logout */}
      <div className="px-3 py-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md group">
          <Avatar className="w-8 h-8 border border-border">
            <AvatarImage src={user.imageUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-secondary text-xs font-semibold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={() => signOut({ redirectUrl: "/" })}
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sidebar principal ─────────────────────────────────────────────────── */

export function Sidebar({ pendingCount, user }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 border-r border-border/60 bg-card/50 backdrop-blur-sm">
        <SidebarContent pendingCount={pendingCount} user={user} />
      </aside>

      {/* ── Mobile: botón hamburguesa + Sheet ───────────────────────────── */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 w-9 h-9 bg-card border border-border shadow-lg"
            >
              {mobileOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-56 p-0 bg-card border-border"
          >
            <SidebarContent
              pendingCount={pendingCount}
              user={user}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}