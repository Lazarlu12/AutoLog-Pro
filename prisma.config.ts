import { defineConfig } from "@prisma/config";
import "dotenv/config"; 

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // Para comandos de terminal (migrate, status), usa la conexión directa
    url: process.env.DIRECT_URL, 
    ...({ directUrl: process.env.DIRECT_URL } as any),
  },
});

