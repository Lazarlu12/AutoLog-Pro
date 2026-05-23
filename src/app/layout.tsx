import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider"; // <-- Importamos el proveedor

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

export const metadata: Metadata = {
  title: {
    default: "AutoLog Pro",
    template: "%s — AutoLog Pro",
  },
  description: "Control inteligente del mantenimiento de tus vehículos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* suppressHydrationWarning es obligatorio al usar next-themes */}
      <html lang="es" suppressHydrationWarning>
        <body
          className={`
            ${geistSans.variable}
            ${geistMono.variable}
            ${outfit.variable}
            min-h-full flex flex-col bg-background text-foreground antialiased transition-colors duration-300
          `}
        >
          {/* Envolvemos la app con el proveedor */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}