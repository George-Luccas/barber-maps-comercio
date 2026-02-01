
import { db } from "../app/_lib/prisma";

async function main() {
  const shop = await db.barbershop.findFirst({
    where: { name: "Car barber" }
  });

  if (!shop) {
    console.error("Shop 'Car barber' not found.");
    return;
  }

  console.log(`Setting up data for shop: ${shop.name} (${shop.id})`);

  // 1. Add a Barber
  const barber = await db.barber.upsert({
    where: { id: "barber-test-id" }, // Using a fixed ID for upsert or just create
    create: {
      id: "barber-test-id",
      name: "João do Carro",
      barbershopId: shop.id,
      imageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400"
    },
    update: {
      barbershopId: shop.id
    }
  });
  console.log(`Barber synced: ${barber.name}`);

  // 2. Add Photos to Gallery
  const updatedShop = await db.barbershop.update({
    where: { id: shop.id },
    data: {
      photos: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800",
        "https://images.unsplash.com/photo-1512690196252-7476294a2912?w=800"
      ]
    }
  });
  console.log(`Gallery photos updated: ${updatedShop.photos.length}`);

  // 3. Add Products (Frigobar)
  const product = await db.barbershopProduct.create({
    data: {
      name: "Cerveja Gelada",
      description: "Frigobar premium",
      priceInCents: 1500,
      quantity: 10,
      barbershopId: shop.id,
      imageUrl: "https://images.unsplash.com/photo-1618885472118-4e68af330764?w=400"
    }
  });
  console.log(`Product added: ${product.name}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await db.$disconnect();
  });
