
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const email = 'georgeluccas300@gmail.com';
  const shopId = '8c881a16-3c34-4a54-b284-a333b54db75e'; // proper ID found in debug step

  console.log(`Relinking shop ${shopId} to user ${email}...`);

  // 1. Get User ID
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found!");
  }

  // 2. Update Shop
  await db.barbershop.update({
    where: { id: shopId },
    data: { managerId: user.id }
  });

  console.log("Successfully relinked!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
