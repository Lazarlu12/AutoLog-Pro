import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getPendingCount } from "@/actions/reminders";
import { Sidebar } from "@/components/dashboard/Sidebar";

/**
 * Dashboard Layout — Server Component.
 *
 * Responsabilidades:
 *  1. Verificar autenticación (requireAuth redirige si no hay sesión)
 *  2. Obtener datos del usuario y contador de recordatorios pendientes
 *  3. Pasarlos al Sidebar (Client Component) vía props
 *  4. Renderizar el shell: sidebar + área principal
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Si no hay sesión, requireAuth redirige al sign-in automáticamente
  const user = await requireAuth();

  const countResult = await getPendingCount();
  const pendingCount = countResult.success ? countResult.data.count : 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar recibe datos serializables como props */}
      <Sidebar
        pendingCount={pendingCount}
        user={{
          name: user.name, //TODO: arregla error
          email: user.email,
          imageUrl: user.imageUrl,
        }}
      />

      {/* Área de contenido principal */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Espaciado top en mobile para el botón hamburguesa */}
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}