import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Bell,
  FileText,
  Gauge,
  Shield,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AutoLog Pro — Control inteligente de mantenimiento",
  description:
    "Registrá el mantenimiento de tus vehículos, recibí recordatorios automáticos y mantené toda la documentación en un solo lugar.",
};

/* ─── Features ──────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Car,
    title: "Gestión de flota",
    desc: "Controlá todos tus vehículos desde un solo lugar. Auto, moto, camioneta — sin límites.",
  },
  {
    icon: Bell,
    title: "Recordatorios automáticos",
    desc: "Alertas por fecha y por kilometraje. Nunca más te olvidés de un cambio de aceite.",
  },
  {
    icon: FileText,
    title: "Documentación digital",
    desc: "Seguro, VTV, manual de servicio. Todo guardado y con alertas de vencimiento.",
  },
  {
    icon: Gauge,
    title: "Historial completo",
    desc: "Cada mantenimiento registrado con fecha, km, costo y proveedor. Trazabilidad total.",
  },
  {
    icon: Shield,
    title: "Privacidad garantizada",
    desc: "Tus datos son tuyos. Almacenamiento seguro con acceso restringido a tu cuenta.",
  },
  {
    icon: Zap,
    title: "Rapidísimo",
    desc: "Interfaz diseñada para registrar un mantenimiento en menos de 30 segundos.",
  },
];

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-md rotate-45 group-hover:bg-primary/30 transition-colors" />
              <Car className="relative w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-sm text-foreground">
              AutoLog <span className="text-primary">Pro</span>
            </span>
          </Link>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/sign-in">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/sign-up">Empezar gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">

        <Badge
          variant="outline"
          className="mb-6 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1"
        >
          ✦ Mantenimiento inteligente
        </Badge>

        <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
          Tu flota, siempre en{" "}
          <span className="relative inline-block">
            <span className="text-primary">punto</span>
            {/* Subrayado decorativo */}
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Registrá mantenimientos, documentos y recordatorios de todos tus vehículos. 
          AutoLog Pro te avisa antes de que sea tarde.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Link href="/sign-up">
              Comenzar ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary">
            <Link href="/sign-in">Ya tengo cuenta</Link>
          </Button>
        </div>

        {/* Social proof chico */}
        <div className="mt-8 flex items-center justify-center gap-5 text-xs text-muted-foreground">
          {["Sin tarjeta de crédito", "Setup en 2 minutos", "Gratis para siempre"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-primary" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Preview del dashboard (mockup estilizado) ───────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="relative rounded-xl border border-border/60 bg-card overflow-hidden shadow-2xl shadow-black/40">
          {/* Barra de título tipo app */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/40 bg-secondary/30">
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="ml-3 text-xs text-muted-foreground">autolog.pro/dashboard</span>
          </div>
          {/* Placeholder del dashboard */}
          <div className="p-6 grid grid-cols-3 gap-4 min-h-48">
            {["Mis vehículos", "Próximos", "Vencidos"].map((label, i) => (
              <div key={label} className="bg-secondary/40 rounded-lg p-4 border border-border/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="font-display text-2xl font-bold mt-2 text-foreground">{i === 0 ? "3" : i === 1 ? "2" : "0"}</p>
              </div>
            ))}
          </div>
          {/* Glow effect */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Todo lo que necesitás
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Pensado para conductores exigentes que quieren cuidar su inversión.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-5 rounded-xl border border-border/60 bg-card hover:border-primary/20 hover:bg-card/80 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────── */}
      <section className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Empezá a cuidar tu flota hoy
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Gratis, sin límite de vehículos. Registrate en segundos.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Link href="/sign-up">
              Crear mi cuenta gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 AutoLog Pro</span>
          <span>Hecho con precisión.</span>
        </div>
      </footer>
    </div>
  );
}