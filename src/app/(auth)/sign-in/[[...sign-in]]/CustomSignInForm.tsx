// src/app/(auth)/sign-in/[[...sign-in]]/CustomSignInForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Copy, Info, Loader2, Sparkles, LogIn } from "lucide-react";
import { toast } from "sonner";

export function CustomSignInForm() {
  const { client, setActive } = useClerk();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authReady = mounted && !!client && !!setActive;

  const demoEmail = "reclutadores9autolog@gmail.com";
  const demoPass = "DemoAutoLog2026!";

  const handleCopy = (
    e: React.MouseEvent,
    text: string,
    type: "Email" | "Contraseña",
  ) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado al portapapeles`);
  };

  const authenticateUser = async (
    identifierValue: string,
    passwordValue: string,
  ) => {
    if (!authReady) {
      toast.error("Clerk todavía está cargando.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Verificando credenciales...");

    try {
      const result = await client.signIn.create({
        identifier: identifierValue,
        password: passwordValue,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        toast.success("¡Acceso concedido!", { id: toastId });
        router.push("/dashboard");
        return;
      }

      if (
        result.status === "needs_client_trust" ||
        result.status === "needs_second_factor"
      ) {
        toast.error(
          "Este acceso requiere verificación adicional. Para la demo, usa el botón 1-clic.",
          { id: toastId },
        );
        return;
      }

      toast.error(`No se pudo completar el inicio (${result.status}).`, {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || "Error al iniciar sesión.", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void authenticateUser(email, password);
  };

  const handleDemoLogin = () => {
  window.location.assign("/api/demo-login");
};

  return (
    <div className="w-full space-y-6">
      <form
        onSubmit={handleStandardLogin}
        className="w-full space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Bienvenido a AutoLog Pro
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ingresá con tu cuenta para continuar
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-100"
              placeholder="tu@correo.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-100"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !authReady}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          Iniciar Sesión
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-50 px-2 text-zinc-500 dark:bg-zinc-950">
            O acceso rápido
          </span>
        </div>
      </div>

      <div className="w-full space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Acceso demo para reclutadores
          </h3>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Este acceso entra sin Gmail ni contraseña. Usa un ticket de un solo
          uso.
        </p>

        <button
  type="button"
  onClick={handleDemoLogin}
  disabled={!authReady}
  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
>
  <Sparkles className="h-4 w-4" />
  Entrar a la demo con 1 clic
</button>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-2.5 dark:border-zinc-800/50 dark:bg-zinc-950">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Email
              </span>
              <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                {demoEmail}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => handleCopy(e, demoEmail, "Email")}
              className="rounded-md border border-zinc-200 bg-white p-2 text-zinc-400 transition-colors hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:text-zinc-100"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-2.5 dark:border-zinc-800/50 dark:bg-zinc-950">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Contraseña
              </span>
              <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                {demoPass}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => handleCopy(e, demoPass, "Contraseña")}
              className="rounded-md border border-zinc-200 bg-white p-2 text-zinc-400 transition-colors hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:text-zinc-100"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
