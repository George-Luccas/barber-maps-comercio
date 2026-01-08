import { NextResponse } from "next/server";
import { db } from "@/app/_lib/prisma";

export async function GET(request: Request) {
  try {
    // Verificar autenticação do cron (Opcional: Header 'Authorization')
    // Vercel Cron envia um header 'Authorization: Bearer <CRON_SECRET>'
    // Para simplificar no plano free, verificamos apenas se é uma chamada GET
    
    // Data de corte: 12 meses atrás
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

    console.log(`[CRON] Iniciando limpeza de agendamentos anteriores a ${cutoffDate.toISOString()}`);

    const deleted = await db.booking.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`[CRON] Limpeza concluída. ${deleted.count} agendamentos removidos.`);

    return NextResponse.json({
      success: true,
      message: `${deleted.count} agendamentos antigos removidos.`,
      cutoffDate: cutoffDate.toISOString(),
    });

  } catch (error: any) {
    console.error("[CRON] Erro na limpeza de agendamentos:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
