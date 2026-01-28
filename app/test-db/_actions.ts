"use server";

import { db } from "@/app/_lib/prisma";

export async function testDatabaseConnection() {
  const start = Date.now();
  try {
    // Tenta uma query raw simples que nao depende de schema
    // @ts-ignore
    const rawResult = await db.$queryRaw`SELECT 1 as result`;
    
    // Tenta verificar se a tabela User existe e tem dados
    const userCount = await db.user.count();

    const duration = Date.now() - start;

    return {
      success: true,
      message: "Conexão e Schema verificados com sucesso!",
      latency: `${duration}ms`,
      userCount,
      timestamp: new Date().toISOString(),
      // Retorna infos do ambiente (sem expor senhas)
      envCheck: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        databaseUrlPrefix: process.env.DATABASE_URL?.split(':')[0]
      }
    };
  } catch (error: any) {
    const duration = Date.now() - start;
    return {
      success: false,
      error: error.message,
      code: error.code,
      meta: error.meta,
      duration: `${duration}ms`,
      stack: error.stack
    };
  }
}

export async function resetDatabase() {
  try {
    // Ordem importa por causa das chaves estrangeiras
    await db.financialTransaction.deleteMany({});
    await db.stockItem.deleteMany({});
    await db.booking.deleteMany({});
    await db.barbershopService.deleteMany({});
    await db.barbershop.deleteMany({});
    // Por último o usuário
    await db.user.deleteMany({});
    

    return { success: true, message: "Banco de dados limpo com sucesso!" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRecentBookings() {
  try {

    const bookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        BarbershopService: true,
      }
    });
    return bookings;
  } catch (error) {
    return [];
  }
}
