import { auth } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { redirect } from "next/navigation";
import ForceLogout from "@/app/components/ForceLogout";
import BarberProfileClient from "./_components/barber-profile-client";

export default async function BarberProfilePage() {
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
        image: true,
        bio: true,
        specialties: true,
        isAutonomous: true,
        workplaceName: true,
        role: true,
        createdAt: true,
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return <ForceLogout />;
  }

  if (!dbUser) {
    return <ForceLogout />;
  }

  // Only allow BARBER_PROMO users
  if (dbUser.role !== "BARBER_PROMO") {
    redirect("/");
  }

  // Fetch portfolio server-side
  const portfolioItems = await db.barberPortfolio.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    select: {
        id: true,
        imageUrl: true,
        description: true,
    }
  });

  return (
    <BarberProfileClient 
      user={{
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone || "",
        image: dbUser.image || "",
        bio: dbUser.bio || "",
        specialties: dbUser.specialties || [],
        isAutonomous: dbUser.isAutonomous,
        workplaceName: dbUser.workplaceName || "",
        createdAt: dbUser.createdAt.toISOString(),
      }}
      initialPortfolio={portfolioItems}
    />
  );
}
