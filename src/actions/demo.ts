"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function resetDemoData() {
  const user = await requireAuth();

  console.log("--- DEBUG DE RESET ---");
  console.log("Usuario autenticado:", user.email);
  console.log("ID del usuario:", user.id);

  // 1. Verificación de seguridad (más flexible)
  // Esto funcionará si el email contiene "autolog"
  if (!user.email?.includes("autolog")) {
    console.log("No es un usuario autorizado para resetear.");
    return { success: false, message: "No autorizado" };
  }

  // 2. Buscamos vehículos antes de borrar
  const vehiclesCount = await prisma.vehicle.count({
    where: { userId: user.id },
  });

  console.log("Vehículos encontrados en la DB para este ID:", vehiclesCount);

  if (vehiclesCount === 0) {
    console.log("⚠️ No se encontraron vehículos para el ID:", user.id);
    return { success: false, message: "No se encontraron datos para borrar" };
  }

  // 3. Procedemos al borrado
  try {
    const deleted = await prisma.vehicle.deleteMany({
      where: { userId: user.id },
    });
    
    console.log("✅ Borrado exitoso. Registros eliminados:", deleted.count);
    return { success: true };
  } catch (error) {
    console.error("❌ Error grave al borrar:", error);
    return { success: false, message: "Error al resetear" };
  }
}