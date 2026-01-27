
import { db } from "@/app/_lib/prisma";

async function main() {
  console.log("--- Analyzing Database ---");

  // 1. List all tables (Postgres specific)
  try {
    const tables: any[] = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Tables in database:", tables.map(t => t.table_name).join(", "));
  } catch (e) {
    console.error("Could not list tables:", e);
  }

  // 2. Count Users
  const totalUsers = await db.user.count();
  console.log(`Total Users: ${totalUsers}`);

  // 3. Analyze User Roles
  const roles = await db.user.groupBy({
    by: ['role'],
    _count: {
      _all: true
    }
  });
  console.log("User Roles Distribution:", roles);

  // 4. Analyze Relations
  // How many users manage a barbershop?
  const managers = await db.user.count({
    where: {
      Barbershop: { isNot: null }
    }
  });
  console.log(`Users managing a barbershop: ${managers}`);

  // How many users have bookings?
  // Since there is no direct relation in schema User -> Booking[], we have to query Booking or use where
  // Wait, schema said: Booking has userId. 
  // We can count distinct userIds in Booking table.
  const usersWithBookings = await db.booking.groupBy({
    by: ['userId'],
    _count: {
      _all: true // just to group
    }
  });
  console.log(`Users with bookings: ${usersWithBookings.length}`);

  // Sample listing (first 10) to see emails/patterns
  const sampleUsers = await db.user.findMany({
    take: 10,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      Barbershop: { select: { id: true, name: true } }
    }
  });
  console.log("Sample Users:", JSON.stringify(sampleUsers, null, 2));

}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
