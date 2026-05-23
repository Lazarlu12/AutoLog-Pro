import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { getPendingCount } from "@/actions/reminders";
import { Sidebar } from "@/components/dashboard/Sidebar";

/**
 * Dashboard Layout — Server Component.
 * Responsabilidades:
 * 1. Verificar autenticación (requireAuth redirige si no hay sesión)
 * 2. Obtener datos del usuario y contador de recordatorios pendientes
 * 3. Pasarlos al Sidebar (Client Component) vía props
 * 4. Renderizar el shell: sidebar + área principal
 *
 * NOTA sobre nombres:
 * requireAuth() devuelve el usuario de la DB (campo `name` = fullName del webhook).
 * Si el usuario no configuró nombre completo, ese campo es null.
 * Por eso usamos currentUser() de Clerk para obtener firstName/lastName
 * por separado — Clerk los guarda individualmente aunque fullName sea null.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Si no hay sesión, requireAuth redirige al sign-in automáticamente
  const user = await requireAuth();

  // currentUser() de Clerk tiene firstName y lastName separados,
  // más confiables que fullName cuando el usuario solo puso uno de los dos.
  // Next.js cachea internamente la llamada a Clerk, no hay doble fetch real.
  const clerkUser = await currentUser();

  // Construye el nombre para mostrar:
  // - "Juan García" si tiene ambos
  // - "Juan" si solo tiene primero
  // - null si no puso ninguno → el Sidebar muestra "Usuario" como fallback
  const displayName =
    clerkUser
      ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null
      : null;

  // Obtiene la cantidad de recordatorios pendientes del usuario
  const countResult = await getPendingCount();
  const pendingCount = countResult.success ? countResult.data.count : 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar recibe datos serializables como props */}
      <Sidebar
        pendingCount={pendingCount}
        user={{
          name: displayName ?? "",
          email: user.email,
          imageUrl: user.imageUrl ?? clerkUser?.imageUrl ?? null,
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