
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

const db = new PrismaClient();

async function check() {
  try {
    // 1. Find the barbershop
    const barbershop = await db.barbershop.findFirst({
      where: {
        name: {
          contains: 'Car', 
          mode: 'insensitive'
        }
      }
    });

    if (!barbershop) {
      console.log("Barbershop with 'Car' not found. Listing all:");
      const allShops = await db.barbershop.findMany({ take: 5, select: { name: true, id: true } });
      console.log(allShops);
      return;
    }

    console.log(`Found Barbershop: ${barbershop.name} (ID: ${barbershop.id})`);

    // 2. Find bookings for today
    const now = new Date();
    // Use the current date for "today"
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    console.log(`Searching for bookings between ${todayStart.toISOString()} and ${todayEnd.toISOString()}`);

    const bookings = await db.booking.findMany({
      where: {
        barbershopId: barbershop.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        }
      }
    });
    
    // Schema correction: Booking has 'userId' and NO relation named 'user' in the Booking model definition shown in previous turns?
    // Wait, looking at schema.prisma from previous turn:
    // model Booking { ... userId String ... user User? (Wait, schema.prisma showed `userId String` but NO `user User` relation in Booking??)
    // Let me re-read schema.prisma from Step 24.
    // Line 106: UsageLog?
    // Line 103: barber Barber?
    // Line 104: Barbershop Barbershop
    // Line 105: BarbershopService BarbershopService
    // It seems Booking does NOT have a relation to User in the schema I saw?
    // Line 93: userId String
    // But in User model (Line 207): reviews Review[] ... bookings is NOT listed in User model either? 
    // Wait, look at User model (Line 188). 
    // Line 36 in Barbershop model: Booking Booking[]
    // I need to check if there is a relation.
    // Actually, looking at Step 24 output again...
    // Booking model (lines 88-107):
    //   userId String
    //   ...
    //   barber Barber? ...
    //   Barbershop Barbershop ...
    //   BarbershopService ...
    // THERE IS NO `user` relation defined in `Booking` model in the provided schema!
    // But `userId` exists.
    // So I have to manually fetch users or use `userId`.
    
    // Re-checking User model (lines 188-210):
    // It has `LoyaltyCard`, `account`, `session`, but NO `bookings` field.
    
    // Wait, in Step 21 (booking API):
    // const bookings = await db.booking.findMany({ where: { userId: user.id } ... })
    // It uses `userId` field.
    
    // So I can get bookings, collect userIds, and then fetch users.

    // Correction for the script:
    const bookingsForToday = await db.booking.findMany({
        where: {
          barbershopId: barbershop.id,
          date: {
            gte: todayStart,
            lte: todayEnd,
          }
        }
      });

    console.log(`Found ${bookingsForToday.length} bookings for today.`);

    if (bookingsForToday.length > 0) {
        const userIds = bookingsForToday.map(b => b.userId);
        const users = await db.user.findMany({
            where: {
                id: { in: userIds }
            }
        });

        console.log("\nUsers with appointments today:");
        users.forEach(u => {
            const booking = bookingsForToday.find(b => b.userId === u.id);
            console.log(`- Name: ${u.name}, Email: ${u.email}, Time: ${booking?.date.toISOString()}, Status: ${booking?.status}`);
        });
        
        // Also check if 'userName' (guest name) is stored in booking
        bookingsForToday.forEach(b => {
             if (!users.find(u => u.id === b.userId)) {
                 console.log(`- Guest/Unknown User (ID: ${b.userId}): Name in booking: ${b.userName || 'N/A'}, Time: ${b.date.toISOString()}`);
             }
        });
    }

  } catch (error) {
    console.error(error);
  } finally {
    await db.$disconnect();
  }
}

check();
