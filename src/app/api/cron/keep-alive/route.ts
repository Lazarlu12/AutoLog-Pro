import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // Verifica el token secreto enviado por Vercel para que nadie externo use tu API
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Ejecuta una consulta nativa ultraligera que registra actividad en Supabase
    await prisma.$executeRaw`SELECT 1;`;
    return NextResponse.json({ success: true, message: 'Supabase status: Active' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
