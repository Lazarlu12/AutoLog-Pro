import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const demoUserId = process.env.DEMO_CLERK_USER_ID;

  if (!demoUserId) {
    return NextResponse.json(
      { error: "Falta DEMO_CLERK_USER_ID" },
      { status: 500 }
    );
  }

  try {
    const client = await clerkClient();

    const token = await client.signInTokens.createSignInToken({
      userId: demoUserId,
      expiresInSeconds: 5 * 60,
    });

    const url = new URL("/sign-in", req.url);
    url.searchParams.set("token", token.token);

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("demo-login error:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar la demo" },
      { status: 500 }
    );
  }
}