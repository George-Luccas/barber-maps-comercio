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
