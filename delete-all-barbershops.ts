
import { db } from "./app/_lib/prisma";

async function main() {
  console.log("⚠️  INICIANDO EXCLUSÃO DE TODAS AS BARBEARIAS...");
  console.log("Isso excluirá: Serviços, Barbeiros, Agendamentos, Transações, Estoque, Estilos, Produtos.");
  console.log("Os USUÁRIOS serão mantidos.");

  try {
    // 1. Delete all barbershops
    // Due to onDelete: Cascade in schema, this removes all related data automatically.
    const deleted = await db.barbershop.deleteMany({});

    console.log(`✅ SUCESSO! ${deleted.count} barbearias foram excluídas.`);
    console.log("Os usuários permanecem no banco de dados.");

  } catch (error) {
    console.error("❌ ERRO AO EXCLUIR:", error);
  }
}

main();
