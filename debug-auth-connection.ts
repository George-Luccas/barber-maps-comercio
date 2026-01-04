
import { PrismaClient } from "@prisma/client";

// Tenta conectar usando a URL de banco de dados de AUTH (se definida no ambiente, aqui simulamos pegando de process.env)
// Como não temos acesso direto ao arquivo .env carregado pelo runner nessse script avulso facilmente sem dotenv, 
// vamos assumir que o ambiente tem AUTH_DATABASE_URL. 
// Se não, o usuário terá que confirmar.

const authUrl = process.env.AUTH_DATABASE_URL;

async function main() {
  console.log("🔍 Testing AUTH Database Connection...");
  console.log(`AUTH_DATABASE_URL defined? ${!!authUrl}`);

  if (!authUrl) {
      console.error("❌ AUTH_DATABASE_URL is not set.");
      return;
  }

  const prismaAuth = new PrismaClient({
      datasources: {
          db: {
              url: authUrl
          }
      }
  });

  try {
      const userCount = await prismaAuth.user.count();
      console.log(`✅ Connected to AUTH DB! Found ${userCount} users.`);
      
      const sampleUser = await prismaAuth.user.findFirst();
      console.log("Sample User:", sampleUser);

  } catch (error) {
      console.error("❌ Failed to connect to AUTH DB:", error);
  } finally {
      await prismaAuth.$disconnect();
  }
}

main();
