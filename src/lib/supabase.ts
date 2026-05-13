import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con service_role.
 * Solo usar en Server Actions / Server Components / API Routes.
 * NUNCA exponer al cliente — bypassa RLS igual que Prisma.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // Deshabilitar persistencia de sesión — este cliente es solo para operaciones de servidor
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const STORAGE_BUCKET = "autolog-documents" as const;