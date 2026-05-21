"use client";

import { Copy, Info } from "lucide-react";
import { toast } from "sonner";

export function DemoCredentials() {
  const demoEmail = "reclutadores@autolog.pro";
  const demoPass = "DemoAutoLog2026!";

  const handleCopy = (text: string, type: "Email" | "Contraseña") => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado al portapapeles`);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
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
            onClick={() => handleCopy(demoEmail, "Email")}
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
            onClick={() => handleCopy(demoPass, "Contraseña")}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 transition-colors"
            title="Copiar Contraseña"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}