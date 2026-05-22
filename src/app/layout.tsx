import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

/* ─── Fuentes ───────────────────────────────────────────────────────────── */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

/* ─── Layout Raíz ────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${outfit.variable}
          dark h-full antialiased
        `}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          {children}
          
          {/* Componente Toaster para notificaciones globales */}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "hsl(240 5% 10%)",     // zinc-950
                border: "1px solid hsl(240 4% 16%)", // zinc-800
                color: "hsl(240 5% 84%)",            // zinc-300
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}