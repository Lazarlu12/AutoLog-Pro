import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle"; // <--- Tu botón de tema
import Footer from "@/components/Footer";
import {
  Car,
  Bell,
  FileText,
  Gauge,
  ArrowRight,
  UserCheck
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      
      {/* ─── Navegación ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">AutoLog Pro</span>
          </div>

          <div className="flex items-center gap-4">
            {/* El Switcher de Tema */}
            <ThemeToggle />
            
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/sign-in">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Comenzar gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
        
        <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-foreground max-w-3xl animate-fade-up">
          Gestión digital de vehículos y flotas, <span className="text-primary">en un solo lugar.</span>
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl animate-fade-up" style={{ animationDelay: "100ms" }}>
          Digitalizá el historial clínico de tus autos. Llevá el registro de mantenimientos, gastos y alertas de tu flota estés donde estés.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Button size="lg" className="h-12 px-8 gap-2 w-full sm:w-auto" asChild>
            <Link href="/sign-up">
              Crear mi cuenta <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          {/* Botón específico para reclutadores */}
          <Button size="lg" variant="outline" className="h-12 px-8 gap-2 w-full sm:w-auto border-dashed border-zinc-400 hover:border-primary hover:bg-primary/5" asChild>
            <Link href="/sign-in">
              <UserCheck className="w-4 h-4 text-primary" />
              Probar cuenta demo
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}