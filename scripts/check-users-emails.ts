
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function check() {
  try {
    const users = await db.user.findMany({
      where: {
        email: {
          in: ['georgeluccas300@gmail.com', 'georgeluccas54@gmail.com']
        }
      }
    });
    
    console.log("Found users:", users.length);
    users.forEach(u => {
        console.log(`ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, CreatedAt: ${u.createdAt}`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await db.$disconnect();
  }
}

check();
