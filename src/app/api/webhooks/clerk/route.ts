import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET no definido en .env");
  }

  // Verificar firma del webhook
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Headers de verificación faltantes", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Firma inválida", { status: 400 });
  }

  // Manejar eventos
  switch (evt.type) {
    case "user.created": {
      // Agregamos una validación de seguridad
      const email = evt.data.email_addresses?.[0]?.email_address;
      
      if (!email || !evt.data.id) {
        return new Response("Faltan datos del usuario (email o id)", { status: 400 });
      }

      await prisma.user.create({
        data: {
          clerkId: evt.data.id,
          email: email,
          name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim() || "Usuario sin nombre",
          imageUrl: evt.data.image_url ?? "",
        },
      });
      break;
    }
    // ... (lo mismo para user.updated si quieres)
  

    case "user.updated": {
      await prisma.user.update({
        where: { clerkId: evt.data.id },
        data: {
          email: evt.data.email_addresses[0].email_address,
          name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim(),
          imageUrl: evt.data.image_url,
        },
      });
      break;
    }

    case "user.deleted": {
      if (evt.data.id) {
        await prisma.user.delete({
          where: { clerkId: evt.data.id },
        });
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}