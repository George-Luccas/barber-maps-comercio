
import { db } from "./app/_lib/prisma";

async function main() {
  console.log("⚠️  INICIANDO EXCLUSÃO DE TODOS OS USUÁRIOS...");
  console.log("Isso limpará o banco de dados completamente (Usuários, Contas, Sessões, Barbearias, etc).");

  try {
    // Delete all users. 
    // If there were any remaining barbershops/data connected to users, 
    // the foreign keys/cascade would handle specific relations, 
    // but usually user is the top level.
    const deleted = await db.user.deleteMany({});

    console.log(`✅ SUCESSO! ${deleted.count} usuários foram excluídos.`);
    console.log("O banco de dados está limpo para novos cadastros.");

  } catch (error) {
    console.error("❌ ERRO AO EXCLUIR USUÁRIOS:", error);
  }
}

main();
