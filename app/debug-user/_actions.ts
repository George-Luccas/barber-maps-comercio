"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";

export async function runDiagnostics() {
  const logs: string[] = [];
  const log = (msg: string) => logs.push(`[${new Date().toISOString().split('T')[1].slice(0,8)}] ${msg}`);

  log("Iniciando diagnósticos backend...");

  try {
      // 1. Check Session
      log("1. Verificando Sessão...");
      const session = await auth();
      log(`   Sessão: ${session ? "Ativa" : "Nula"}`);
      if (session?.user) {
          log(`   User ID: ${session.user.id}`);
          log(`   Email: ${session.user.email}`);
          log(`   Role: ${(session.user as any).role}`);
      } else {
          log("   ABORTANDO: Usuário não logado. Faça login antes.");
          return logs;
      }

      const email = session.user.email!;

      // 2. Check Simple User Query
      log("2. Teste: db.user.findUnique (SELECT ID)");
      try {
          const u = await db.user.findUnique({
              where: { email },
              select: { id: true }
          });
          log(`   SUCESSO! ID encontrado: ${u?.id}`);
      } catch (e: any) {
          log(`   FALHA: ${e.message}`);
      }

      // 3. Check FindUnique with Include (Simulating unsafe query)
      log("3. Teste: db.user.findUnique (NO SELECT / FLAKY)");
      try {
          const u = await db.user.findUnique({ where: { email } });
          log(`   SUCESSO! (Mas este é o query perigoso)`);
      } catch (e: any) {
          log(`   FALHA CONFIRMADA: ${e.message}`);
          log("   -> Isso confirma que colunas fantasmas ainda estão no Client.");
      }

      // 4. Check Admin Dashboard Query Logic
      log("4. Teste: Listar Usuários (Admin Query)");
      try {
           const users = await db.user.findMany({
               take: 1,
               select: { id: true, name: true, email: true, role: true }
           });
           log(`   SUCESSO! ${users.length} usuário(s) recuperado(s).`);
      } catch (e: any) {
           log(`   FALHA: ${e.message}`);
      }

      // 5. Check Barbershops Logic
      log("5. Teste: Listar Barbearias com Manager");
      try {
          const shops = await db.barbershop.findMany({
              take: 1,
              include: {
                  manager: {
                      select: { id: true, name: true } // Safe select
                  }
              }
          });
          log(`   SUCESSO! ${shops.length} barbearia(s) recuperada(s).`);
      } catch (e: any) {
           log(`   FALHA: ${e.message}`);
      }

      log("Diagnóstico concluído.");

  } catch (error: any) {
      log(`ERRO GERAL: ${error.message}`);
  }

  return logs;
}
