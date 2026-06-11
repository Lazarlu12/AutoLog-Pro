// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CustomSignInForm } from "./CustomSignInForm";
import { DemoTokenAutoLogin } from "./DemoTokenAutoLogin";

export const metadata = {
  title: "Iniciar Sesión — AutoLog Pro",
};

type SignInPageProps = {
  searchParams?: Promise<{
    token?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.userId) {
    redirect("/dashboard");
  }

  const resolved = searchParams ? await searchParams : undefined;
  const tokenParam = resolved?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        {token ? <DemoTokenAutoLogin token={token} /> : <CustomSignInForm />}
      </div>
    </div>
  );
}