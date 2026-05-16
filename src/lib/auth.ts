import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// ─── requireAuth ─────────────────────────────────────────────────────────────
// 1. Verifica sesión de Clerk → si no hay, redirige a /sign-in
// 2. Busca el User en la DB por clerkId
// 3. Si no existe (webhook no disparó en local), lo crea desde los datos de Clerk
// 4. Garantiza que name siempre es string (nunca null)

export async function requireAuth() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // Intento 1: buscar usuario existente en la DB
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  // Intento 2: si no existe, crearlo desde Clerk (típico en desarrollo local
  // donde el webhook de Clerk no tiene una URL pública para disparar)
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      "Usuario";

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? "";

    user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        name,
        email,
        imageUrl: clerkUser.imageUrl ?? null,
      },
      create: {
        clerkId,
        name,
        email,
        imageUrl: clerkUser.imageUrl ?? null,
      },
    });
  }

  return {
    ...user,
    name: user.name ?? "Usuario", // garantía extra de non-null
  };
}