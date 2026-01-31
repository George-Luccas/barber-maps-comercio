
import { db } from "../app/_lib/prisma";

async function main() {
  console.log("🌱 Seeding Demo Shop...");

  // 1. Create or Find Shop
  const shopId = "demo-shop-uuid";
  const shop = await db.barbershop.upsert({
    where: { id: shopId },
    update: {},
    create: {
      id: shopId,
      name: "Demo Barber Shop",
      address: "Rua Teste, 123",
      description: "A melhor barbearia de testes da região.",
      imageUrl: "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
      phones: ["11999999999"],
      isOpen: true,
      openingTime: "08:00",
      closingTime: "20:00"
    }
  });

  // 2. Create Service
  const service = await db.barbershopService.create({
    data: {
      name: "Corte de Cabelo",
      description: "Corte simples",
      imageUrl: "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
      priceInCents: 5000,
      barbershopId: shop.id
    }
  });

  // 3. Create Barber
  await db.barber.create({
    data: {
      name: "Barbeiro Teste",
      barbershopId: shop.id
    }
  });

  console.log("✅ Seeded Shop:", shop.name);
  console.log("✅ Seeded Service:", service.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
