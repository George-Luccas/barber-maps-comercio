
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { name: "Barbaros", city: "Florianópolis", state: "SC" },
    { name: "Bárbaros", city: "Florianópolis", state: "SC" }
  ];
  
  console.log("Iniciando atualização de locais...");

  for (const update of updates) {
    const shops = await prisma.barbershop.findMany({
      where: {
        name: {
          contains: update.name,
          mode: 'insensitive'
        }
      }
    });

    console.log(`Encontradas ${shops.length} barbearias para '${update.name}':`);
    
    for (const shop of shops) {
      console.log(`- Atualizando: ${shop.name} (${shop.id})`);
      
      await prisma.barbershop.update({
        where: { id: shop.id },
        data: {
          city: update.city,
          state: update.state
        }
      });
    }
  }

  console.log("Atualização concluída!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
