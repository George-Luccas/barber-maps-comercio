
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const email = "georgeluccas300@gmail.com";
  console.log(`Checking user: ${email}`);

  const user = await db.user.findUnique({
    where: { email },
    include: {
      Barbershop: true,
      account: true
    }
  });

  if (!user) {
    console.log("❌ User NOT found");
    return;
  }

  console.log("✅ User found:");
  console.log(`- ID: ${user.id}`);
  console.log(`- Name: ${user.name}`);
  console.log(`- Role: ${user.role}`);

  if (user.Barbershop) {
    console.log("✅ Barbershop found:");
    console.log(`- ID: ${user.Barbershop.id}`);
    console.log(`- Name: ${user.Barbershop.name}`);
    console.log(`- Suspended: ${user.Barbershop.isSuspended}`);
  } else {
    console.log("❌ NO Barbershop linked to this user!");
    
    // Attempt to find if there are ANY barbershops
    const anyShop = await db.barbershop.findFirst();
    console.log("Checking if ANY barbershop exists...");
    console.log(anyShop ? "✅ At least one shop exists" : "❌ No barbershops in DB");
  }

  // Check if there are other users
  const count = await db.user.count();
  console.log(`Total users in DB: ${count}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await db.$disconnect();
  });
