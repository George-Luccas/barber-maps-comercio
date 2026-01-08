
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const searchTerm = "george barber shop"; // Adjust as needed
  console.log(`Searching for barbershops like: "${searchTerm}"...`);

  const shops = await db.barbershop.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    include: {
      manager: true,
    },
  });

  if (shops.length === 0) {
    console.log("No barbershops found.");
    return;
  }

  for (const shop of shops) {
    console.log(`Found: ${shop.name} (ID: ${shop.id})`);
    console.log(`Manager: ${shop.manager ? shop.manager.name : "NONE (Orphan)"}`);

    // Deleting
    console.log(`Deleting ${shop.name}...`);
    await db.barbershop.delete({
      where: { id: shop.id },
    });
    console.log("Deleted successfully.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
