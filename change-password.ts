
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "georgeluccas300@gmail.com";
  const newPasswordPlain = "436752";

  console.log("Listing all users in DB...");
  const users = await prisma.user.findMany({ select: { email: true } });
  console.log("Users found:", users);

  console.log(`Searching for target user: ${email}...`);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error("User NOT found in this database!");
    // Tentar com AUTH_DATABASE_URL se disponível
    if (process.env.AUTH_DATABASE_URL) {
         console.log("Trying AUTH_DATABASE_URL...");
         const prismaAuth = new PrismaClient({ datasources: { db: { url: process.env.AUTH_DATABASE_URL } } });
         try {
             const userAuth = await prismaAuth.user.findUnique({ where: { email } });
             if (userAuth) {
                 console.log("User found in Auth DB! Updating...");
                 const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);
                 await prismaAuth.user.update({
                    where: { email },
                    data: { password: hashedPassword }
                 });
                 console.log("Password updated in Auth DB successfully!");
                 return;
             }
         } catch(e) {
             console.error("Error connecting to Auth DB:", e);
         } finally {
             await prismaAuth.$disconnect();
         }
    }
    process.exit(1);
  }

  console.log("User found in Main DB. Hashing new password...");
  const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);

  console.log("Updating password...");
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  });

  console.log("Password updated successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
