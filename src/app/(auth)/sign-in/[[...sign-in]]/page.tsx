import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { DemoCredentials } from "./DemoCredentials";

export const metadata = {
  title: "Iniciar Sesión — AutoLog Pro",
};

export default async function SignInPage() {
  // Protección: si ya hay sesión, mandarlo directo al dashboard
  const session = await auth();
  if (session?.userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950 relative">
      
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-md gap-8 animate-fade-in">
        {/* Componente nativo de Clerk */}
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-lg border border-zinc-200 dark:border-zinc-800 rounded-xl",
            }
          }}
        />

        {/* Tarjeta de Cuenta Demo para reclutadores */}
        <DemoCredentials />
      </div>
    </div>
  );
}