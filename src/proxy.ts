import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rutas que NO requieren autenticación
const isPublicRoute = createRouteMatcher([
  "/",                    // landing/marketing
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",    // webhooks de Clerk deben ser públicos
]);

// CAMBIO: Ahora se exporta como una función llamada 'proxy'
export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Aplica a todo excepto archivos estáticos y _next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};