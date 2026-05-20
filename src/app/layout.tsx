import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

/* ─── Fuentes ───────────────────────────────────────────────────────────── */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Outfit — fuente display para headings.
 * Geométrica, moderna, con personalidad propia. Distinta a Geist sin chocar.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* ─── Metadata ──────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: "AutoLog Pro",
    template: "%s — AutoLog Pro",
  },
  description: "Control inteligente del mantenimiento de tus vehículos.",
};

/* ─── Layout ────────────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        // "dark" forzado — AutoLog Pro es dark-only.
        // Esto activa las CSS variables de shadcn/ui para dark mode.
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${outfit.variable}
          dark h-full antialiased
        `}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}