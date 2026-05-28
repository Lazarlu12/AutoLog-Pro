import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-4 md:flex-row sm:px-6 lg:px-8">
        {/* Marca / Nombre */}
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 md:text-left">
          &copy; {currentYear} <span className="font-semibold text-zinc-900 dark:text-zinc-50">AutoLogPro</span>. Todos los derechos reservados.
        </p>

        {/* Créditos de Desarrollo */}
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
          Desarrollado por{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Luca Daniel Lazarte/ Programador FullStack
          </span>
        </p>

        {/* Enlaces opcionales por si en el futuro agregas legales */}
        <div className="flex gap-4 text-xs text-zinc-400 dark:text-zinc-500">
          <Link href="#" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Términos
          </Link>
          <Link href="#" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
