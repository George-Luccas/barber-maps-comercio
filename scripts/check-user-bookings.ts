
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function check() {
  try {
    const user = await db.user.findUnique({
      where: { email: 'georgeluccas300@gmail.com' },
      include: { 
        bookings: {
            include: {
                Barbershop: true,
                BarbershopService: true
            }
        } 
      }
    });

    if (!user) {
        console.log("User not found");
    } else {
        console.log(`User found: ${user.id} (${user.email})`);
        console.log(`Booking count: ${user.bookings.length}`);
        console.log(JSON.stringify(user.bookings, null, 2));
    }
  } catch (error) {
    console.error(error);
  } finally {
    await db.$disconnect();
  }
}

check();
