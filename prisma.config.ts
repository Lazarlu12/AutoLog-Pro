import { defineConfig } from "@prisma/config";
import "dotenv/config"; // Esto carga tu archivo .env inmediatamente

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // Usamos process.env en lugar de la función env()
    url: process.env.DATABASE_URL, 
  },
});

