
import { db } from "../app/_lib/prisma";

async function main() {
  const shop = await db.barbershop.findFirst({ where: { name: "Car barber" } });
  if (!shop) {
    console.error("Shop not found");
    return;
  }
  const id = shop.id;
  console.log(`Testing services logic for Shop ID: ${id}`);

  try {
      const [services, barbers] = await Promise.all([
        db.barbershopService.findMany({
          where: { barbershopId: id, deletedAt: null },
          select: { id: true, name: true, priceInCents: true }
        }),
        db.barber.findMany({
          where: { barbershopId: id },
          select: { id: true, name: true }
        })
      ]);
      console.log(`Services found: ${services.length}`);
      console.log(`Barbers found: ${barbers.length}`);
      if (services.length > 0) console.log(JSON.stringify(services[0], null, 2));
  } catch (error) {
      console.error("ERROR:", error);
  }
}

main();
