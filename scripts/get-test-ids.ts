
import { db } from "../app/_lib/prisma";

async function main() {
  const shop = await db.barbershop.findFirst({
    include: {
        BarbershopService: true
    }
  });

  if (!shop) {
    console.log("No shop found");
    return;
  }

  console.log("SHOP_ID:", shop.id);
  console.log("SERVICE_ID:", shop.BarbershopService[0]?.id || "No Service");
  console.log("SERVICE_NAME:", shop.BarbershopService[0]?.name || "No Service");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
