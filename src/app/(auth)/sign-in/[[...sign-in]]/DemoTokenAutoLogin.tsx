// src/app/(auth)/sign-in/[[...sign-in]]/DemoTokenAutoLogin.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { Loader2, ShieldAlert, Sparkles } from "lucide-react";

type DemoTokenAutoLoginProps = {
  token: string;
};

export function DemoTokenAutoLogin({ token }: DemoTokenAutoLoginProps) {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { signIn } = useSignIn();
  const router = useRouter();

  const ranOnce = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<
    "checking" | "signing-out" | "consuming" | "finalizing" | "done"
  >("checking");

  useEffect(() => {
    if (!token || !signIn || !isLoaded) return;
    if (ranOnce.current) return;

    let cancelled = false;
    ranOnce.current = true;

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(false);
      setError("La demo tardó demasiado en responder.");
    }, 12000);

    const run = async () => {
      try {
        setLoading(true);

        if (isSignedIn) {
          setStep("signing-out");
          await signOut();
          if (cancelled) return;

          // Recarga dura para reiniciar contexto de cookies
          window.location.href = `/sign-in?token=${encodeURIComponent(token)}`;
          return;
        }

        setStep("consuming");
        console.log("[demo] consumiendo ticket:", token);

        const { error: ticketError } = await signIn.ticket({ ticket: token });

        if (cancelled) return;

        if (ticketError) {
          console.error("[demo] signIn.ticket error:", ticketError);
          setError("No se pudo consumir el ticket demo.");
          return;
        }

        console.log("[demo] signIn.status:", signIn.status);

        if (signIn.status === "needs_client_trust") {
          setError(
            "Clerk pidió client trust para esta sesión. La demo 1-clic debe quedar sin esa verificación adicional."
          );
          return;
        }

        if (signIn.status === "needs_second_factor") {
          setError(
            "Clerk pidió un segundo factor. La cuenta demo debe quedar sin MFA para que el 1-clic funcione."
          );
          return;
        }

        if (signIn.status !== "complete") {
          setError(`Clerk devolvió un estado inesperado: ${signIn.status}`);
          return;
        }

        setStep("finalizing");

        await signIn.finalize({
          navigate: async ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              setError("Clerk pidió un paso adicional antes de completar la sesión.");
              return;
            }

            const url = decorateUrl("/dashboard");
            
            // 🔥 LA SOLUCIÓN AL BUCLE:
            // Usamos navegación dura en lugar de router.replace para forzar a 
            // Next.js/Vercel a leer las nuevas cookies de autenticación de Clerk.
            window.location.href = url;
          },
        });

        if (!cancelled) {
          setStep("done");
          // NOTA: Borré el router.replace("/dashboard") de aquí abajo porque
          // window.location.href ya se encarga de cambiar la página.
        }
      } catch (err: any) {
        console.error("[demo] error inesperado:", err);
        if (!cancelled) {
          setError(err.errors?.[0]?.longMessage || "Error inesperado al abrir la demo.");
        }
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [token, signIn, isLoaded, isSignedIn, signOut, router]);

  if (!token) return null;

  if (error) {
    return (
      <div className="w-full rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="h-4 w-4" />
          No se pudo abrir la demo
        </div>
        <p className="mt-2">{error}</p>
        <button
          type="button"
          onClick={() => router.replace("/sign-in")}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-900 dark:text-zinc-100" />
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {step === "signing-out" && "Cerrando sesión actual..."}
            {step === "consuming" && "Ingresando a la demo..."}
            {step === "finalizing" && "Finalizando sesión..."}
            {step === "done" && "Abriendo dashboard..."}
            {step === "checking" && loading && "Preparando acceso..."}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Un momento, activando sesión.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Sparkles className="h-4 w-4" />
        Acceso sin email ni contraseña
      </div>
    </div>
  );
}