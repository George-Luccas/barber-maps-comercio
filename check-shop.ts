import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "georgeluccas300@gmail.com";
  console.log(`Checking user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { Barbershop: true }
  });

  if (!user) {
    console.log("❌ User NOT FOUND in database.");
    return;
  }

  console.log("✅ User FOUND:");
  console.log(`- ID: ${user.id}`);
  console.log(`- Name: ${user.name}`);
  console.log(`- Role: ${user.role}`);
  
  if (user.Barbershop) {
      console.log("✅ Barbershop LINKED:");
      console.log(`- Shop ID: ${user.Barbershop.id}`);
      console.log(`- Shop Name: ${user.Barbershop.name}`);
      console.log(`- Is Suspended: ${user.Barbershop.isSuspended}`);
  } else {
      console.log("❌ NO Barbershop associated with this user.");
      console.log("   -> This causes the ForceLogout on the dashboard.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
