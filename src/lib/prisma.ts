import { Pool } from "pg"; // Asegúrate de haber hecho: npm install pg
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 1. Creamos el pool de conexiones de 'pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// 2. Creamos el adaptador de Prisma
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // Pasamos el adaptador aquí
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
