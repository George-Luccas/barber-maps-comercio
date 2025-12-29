"use server";

import { db } from "@/app/_lib/prisma";

export async function testDatabaseConnection() {
  const start = Date.now();
  try {
    // Tenta uma query raw simples que nao depende de schema
    // @ts-ignore
    const result = await db.$queryRaw`SELECT 1 as result`;
    const duration = Date.now() - start;

    return {
      success: true,
      message: "Conexão estabelecida com sucesso!",
      latency: `${duration}ms`,
      timestamp: new Date().toISOString(),
      // Retorna infos do ambiente (sem expor senhas)
      envCheck: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
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
