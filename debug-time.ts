
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Debugging Timezone Values...");

  // Fetch the most recent booking
  const lastBooking = await prisma.booking.findFirst({
      orderBy: { date: 'desc' },
      take: 1
  });

  if (!lastBooking) {
      console.log("❌ No bookings found.");
      return;
  }

  const date = lastBooking.date;
  
  console.log(" Booking ID:", lastBooking.id);
  console.log("-----------------------------------------");
  console.log(" Raw Date (DB Object):", date);
  console.log(" .toISOString():      ", date.toISOString());
  console.log(" .toUTCString():      ", date.toUTCString());
  console.log("-----------------------------------------");
  console.log(" Display Check:");
  console.log(" pt-BR (Default):     ", date.toLocaleTimeString('pt-BR'));
  console.log(" pt-BR (UTC):         ", date.toLocaleTimeString('pt-BR', { timeZone: 'UTC' }));
  console.log(" pt-BR (Sao_Paulo):   ", date.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
  console.log("-----------------------------------------");
  
  // Calculate hour difference from expected "09:00" if this was the booking in question
  // If date is e.g. 13:00 UTC, Sao Paulo is 10:00.
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
