
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shops = await prisma.barbershop.findMany({
    select: { id: true, name: true }
  });
  console.log("Barbearias encontradas:");
  shops.forEach(s => console.log(`- ${s.name} (${s.id})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
