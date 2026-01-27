
import { db } from "@/app/_lib/prisma";

async function main() {
  console.log("--- STARTING TOTAL DATA CLEANUP ---");
  console.log("WARNING: This will delete ALL users, sessions, accounts, and related data.");

  try {
    // Due to foreign key constraints (Cascade), deleting users should delete related records.
    // However, sometimes circular deps or specific relations need manual handling.
    // The schema has onDelete: Cascade for most relations (Account, Session, Barbershop, etc.)
    
    const deleted = await db.user.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} users successfully.`);

  } catch (error) {
    console.error("❌ Error deleting users:", error);
  }
}

main().finally(() => db.$disconnect());
