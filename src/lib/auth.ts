import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Retorna el User de la DB sincronizado con Clerk.
 * Si no está autenticado, redirige a /sign-in.
 * Uso: const user = await requireAuth()
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // El webhook no sincronizó aún — forzamos sincronización
    const clerkUser = await currentUser();

    if (!clerkUser) redirect("/sign-in");

    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        imageUrl: clerkUser.imageUrl,
      },
    });

    return newUser;
  }

  return user;
}

/**
 * Solo retorna el userId de Clerk sin tocar la DB.
 * Útil para validaciones rápidas en Server Actions.
 */
export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}