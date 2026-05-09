import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in"); // Esto hace la redirección manual
  }

  return <div>Bienvenido al Dashboard</div>;
}
