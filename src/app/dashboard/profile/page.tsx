import { UserProfile } from "@clerk/nextjs";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = {
  title: "Mi Perfil",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2 sm:p-4">
      <PageHeader
        title="Mi Perfil"
        description="Gestioná la seguridad de tu cuenta, correos vinculados y datos personales."
      />

      <div className="flex justify-center pt-4 border-t border-border/40">
        <UserProfile
          routing="hash"
          appearance={{
            variables: {
              colorBackground: "#09090b",       // zinc-950
              colorText: "#fafafa",             // zinc-50
              colorPrimary: "#fafafa",          // zinc-50
              colorInputBackground: "#18181b",   // zinc-900
              colorInputText: "#fafafa",
              colorBorder: "#27272a",           // zinc-800
              colorTextSecondary: "#a1a1aa",    // zinc-400
            },
            elements: {
              cardBox: "border border-zinc-800/80 shadow-none bg-zinc-950/40 w-full rounded-xl overflow-hidden",
              navbar: "border-r border-zinc-900 bg-zinc-950/20",
              headerTitle: "text-zinc-50 font-bold tracking-tight",
              headerSubtitle: "text-zinc-400",
              profileSectionTitleText: "text-zinc-200 font-semibold border-b border-zinc-800 pb-1",
              navbarButton: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50",
              navbarButton__active: "text-zinc-50 bg-zinc-900 font-medium",
              scrollBox: "bg-zinc-950/10",
            },
          }}
        />
      </div>
    </div>
  );
}