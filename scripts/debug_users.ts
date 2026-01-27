
import { db } from "@/app/_lib/prisma";

async function main() {
  try {
    const users = await db.user.findMany({
      take: 5,
      select: { id: true, email: true, role: true }
    });
    console.log("Users:", users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

main().finally(() => db.$disconnect());
