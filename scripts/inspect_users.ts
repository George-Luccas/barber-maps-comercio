
import { db } from "@/app/_lib/prisma";
import fs from "fs";

async function main() {
  console.log("--- Inspecting Users ---");

  const users = await db.user.findMany({
    include: {
      Barbershop: { select: { id: true, name: true } },
      _count: {
        select: {
          Booking: true,
          account: true,
          session: true,
          LoyaltyCard: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Found ${users.length} users.`);

  const dump = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    isBarber: !!u.Barbershop,
    barbershopName: u.Barbershop?.name,
    bookingsCount: u._count.Booking,
    hasAccount: u._count.account > 0,
    hasSession: u._count.session > 0
  }));

  fs.writeFileSync("users_dump.json", JSON.stringify(dump, null, 2));
  console.log("Dumped to users_dump.json");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
