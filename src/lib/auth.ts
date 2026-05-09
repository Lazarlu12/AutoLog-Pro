import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/src/lib/prisma"
import type { User } from "@prisma/client"

/**
 * Verifica autenticación y retorna el User de nuestra DB.
 * Lanza un error si el usuario no está autenticado o no existe en DB.
 * Úsalo al inicio de cada Server Action protegida.
 */
export async function requireAuth(): Promise<User> {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    throw new Error("UNAUTHORIZED")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (!user) {
    // Esto no debería pasar si el webhook de Clerk funciona correctamente.
    // Si ocurre, significa que el usuario existe en Clerk pero no fue sincronizado a la DB.
    throw new Error("USER_NOT_FOUND_IN_DB")
  }

  return user
}

/**
 * Versión que NO lanza error — para layouts y componentes opcionales.
 * Retorna null si no hay sesión.
 */
export async function getAuthUser(): Promise<User | null> {
  try {
    return await requireAuth()
  } catch {
    return null
  }
}