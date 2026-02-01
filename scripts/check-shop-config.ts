
import { db } from "@/app/_lib/prisma";

async function checkConfig() {
  const shopId = "a4061b12-3c70-42d0-bb19-f5f0d6a12d68"; // The one we've been testing
  const userEmail = "georgeluccas300@gmail.com";

  console.log("--- SHOP CONFIG ---");
  const shop = await db.barbershop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      name: true,
      openingTime: true,
      closingTime: true,
      lunchStart: true,
      lunchEnd: true,
      isOpen: true,
      managerId: true
    }
  });
  console.log(shop);

  console.log("\n--- USER CONFIG ---");
  const user = await db.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      name: true,
      email: true
    }
  });
  console.log(user);

  if (shop && user) {
     if (shop.managerId !== user.id) {
         console.log("\n[WARNING] User is NOT the manager of this shop.");
     } else {
         console.log("\n[OK] User IS the manager.");
     }
  }
}

checkConfig();
