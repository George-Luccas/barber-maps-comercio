
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function check() {
  try {
    // Fetch ONLY the latest booking
    const latestBooking = await db.booking.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        Barbershop: { select: { name: true } },
        BarbershopService: { select: { name: true, priceInCents: true } }
      }
    });

    if (!latestBooking) {
        console.log("No bookings found.");
        return;
    }

    const user = await db.user.findUnique({
        where: { id: latestBooking.userId }
    });
    
    console.log("LATEST_BOOKING_CHECK");
    console.log(`BookingID: ${latestBooking.id}`);
    console.log(`UserEmail: ${user ? user.email : 'UNKNOWN_USER'}`);
    console.log(`UserName: ${user ? user.name : 'UNKNOWN_USER'}`);
    console.log(`Service: ${latestBooking.BarbershopService.name}`);
    console.log("END_CHECK");

  } catch (error) {
    console.error(error);
  } finally {
    await db.$disconnect();
  }
}

check();
