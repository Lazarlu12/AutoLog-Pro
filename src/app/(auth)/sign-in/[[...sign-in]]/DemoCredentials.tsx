"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Copy, Info, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function DemoCredentials() {
  // Desestructuramos el objeto completo de Clerk
  const clerkSignIn = useSignIn();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const demoEmail = "reclutadores9autolog@gmail.com";
  const demoPass = "DemoAutoLog2026!";

  // Validamos si Clerk cargó usando el objeto raíz adaptado a las nuevas versiones
  const isLoaded = !!clerkSignIn;

  const handleCopy = (e: React.MouseEvent, text: string, type: "Email" | "Contraseña") => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado al portapapeles`);
  };

  const handleAutoLogin = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    
    const toastId = toast.loading("Autenticando credenciales de prueba...");

    try {
      // Forzamos la firma de tipos dinámica (as any) para evitar restricciones estrictas del compilador
      const signInInstance = (clerkSignIn as any).signIn;
      const setActiveInstance = (clerkSignIn as any).setActive;

      if (!signInInstance || !setActiveInstance) {
        throw new Error("Clerk SDK hooks are not available.");
      }

      // Ejecuta el login programático directo
      const result = await signInInstance.create({
        identifier: demoEmail,
        password: demoPass,
      });

      if (result.status === "complete") {
        await setActiveInstance({ session: result.createdSessionId });
        toast.success("¡Acceso concedido exitosamente!", { id: toastId });
        router.push("/dashboard");
      } else {
        toast.error("Clerness requiere un paso de verificación adicional.", { id: toastId });
      }
    } catch (err: any) {
      console.error("Error en login automático:", err);
      toast.error("Error al iniciar sesión automáticamente.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          ¿Sos reclutador? Probalo rápido
        </h3>
      </div>
      
      <div className="space-y-3">
        {/* Fila Email */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Email</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">{demoEmail}</span>
          </div>
          <button 
            type="button"
            onClick={(e) => handleCopy(e, demoEmail, "Email")}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 transition-colors"
            title="Copiar Email"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* Fila Password */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Contraseña</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">{demoPass}</span>
          </div>
          <button 
            type="button"
            onClick={(e) => handleCopy(e, demoPass, "Contraseña")}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 transition-colors"
            title="Copiar Contraseña"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Botón de Entrada Automática */}
      <button
        type="button"
        onClick={handleAutoLogin}
        disabled={isLoading || !isLoaded}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
        )}
        {isLoading ? "Ingresando..." : "Entrar a la Demo con 1-Clic"}
      </button>
    </div>
  );
}
