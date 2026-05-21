import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner"; // 1. Importamos Toaster
import { ThemeProvider } from "@/components/theme-provider";

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
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}

          {/* 2. Agregamos el componente Toaster personalizado */}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "hsl(240 5% 10%)", // zinc-950
                border: "1px solid hsl(240 4% 16%)", // zinc-800
                color: "hsl(240 5% 84%)", // zinc-300
              },
            }}
          />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
