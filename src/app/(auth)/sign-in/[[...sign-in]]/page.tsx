import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

// Si el usuario ya tiene sesión activa, lo mandamos directo al dashboard.
// Esto resuelve: "The <SignIn/> component cannot render when a user is already signed in"

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <SignIn />
    </div>
  );
}