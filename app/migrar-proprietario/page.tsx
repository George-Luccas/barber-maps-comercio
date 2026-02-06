import { auth } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { redirect } from "next/navigation";
import ForceLogout from "@/app/components/ForceLogout";
import MigrateOwnerClient from "./_components/migrate-owner-client";

export default async function MigrateToOwnerPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Verify user exists in DB
  let dbUser = null;
  try {
    dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        Barbershop: true,
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return <ForceLogout />;
  }

  if (!dbUser) {
    return <ForceLogout />;
  }

  // Only allow BARBER_PROMO users (who want to become owners)
  if (dbUser.role !== "BARBER_PROMO") {
    redirect("/");
  }

  // Already has barbershop
  if (dbUser.Barbershop) {
    redirect("/");
  }

  return (
    <MigrateOwnerClient 
      userId={dbUser.id}
      userName={dbUser.name}
      userPhone={dbUser.phone || ""}
    />
  );
}
