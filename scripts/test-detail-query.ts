
import { db } from "../app/_lib/prisma";

async function main() {
  const id = "a4061b12-3c70-42d0-bb19-f5f0d6a12d68";
  console.log(`Testing detail API for ID: ${id}`);

  try {
    const shop = await db.barbershop.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        imageUrl: true,
        phones: true,
        city: true,
        isOpen: true,
        latitude: true,
        longitude: true,
        photos: true,
        styles: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            priceInCents: true,
            quantity: true,
          }
        }
      },
    });

    console.log("SUCCESS:", !!shop);
    if (shop) console.log(JSON.stringify(shop, null, 2));
  } catch (error) {
    console.error("FAILURE:", error);
  }
}

main();
