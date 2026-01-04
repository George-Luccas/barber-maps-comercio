
import { db } from "./app/_lib/prisma"; // Adjust import path if needed, usually require validation
// Since I can't easily import from app/_lib/prisma in a standalone script without ts-node setup for paths, 
// I will use a direct PrismaClient instantiation or try to use the existing setup if environment permits.
// Easier: simple script using standard imports if ts-node handles aliases, otherwise relative paths.
// 'app' is at root. 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Debugging Radar/Bookings...");

  // 1. Find a barbershop
  const shop = await prisma.barbershop.findFirst();
  
  if (!shop) {
      console.log("❌ No barbershop found.");
      return;
  }
  console.log(`Checking Shop: ${shop.name} (${shop.id})`);

  // 2. Fetch all bookings for this shop to see what exists
  const allBookings = await prisma.booking.findMany({
      where: { barbershopId: shop.id },
      orderBy: { date: 'desc' },
      take: 5
  });

  console.log(`Found ${allBookings.length} recent bookings in DB (Total).`);

  // 3. Simulate getBookings logic for TODAY
  // Use specific date string if needed, or today
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  console.log(`Target Date (UTC String): ${dateStr}`);
  
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
  
  console.log(`Query Interval (UTC): ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`);

  const bookings = await prisma.booking.findMany({
      where: {
        barbershopId: shop.id,
        // Remove restrictive date filter for a moment to see ALL bookings and their dates
      },
      orderBy: {
        date: 'desc'
      },
      take: 10
  });

  console.log(`Found ${bookings.length} recent bookings (ANY DATE) for shop.`);

  // 4. Check Status Calculation
  for (const b of bookings) {
      const bookingTime = new Date(b.date);
      const endTime = new Date(bookingTime.getTime() + 45 * 60000);
      
      let status = 'pendente';
      if (b.cancelledAt) status = 'cancelado';
      else if (now > endTime) status = 'realizado';
      else if (now >= bookingTime && now <= endTime) status = 'em-atendimento';
      
      console.log(`
      - ID: ${b.id.substring(0, 5)}...
      - Date (Raw): ${b.date}
      - Date (ISO): ${bookingTime.toISOString()}
      - EndTime: ${endTime.toISOString()}
      - NOW: ${now.toISOString()}
      - Calculated Status: ${status.toUpperCase()}
      `);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
