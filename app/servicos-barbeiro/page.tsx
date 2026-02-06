import { auth } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { redirect } from "next/navigation";
import ForceLogout from "@/app/components/ForceLogout";
import BarberServicesClient from "./_components/barber-services-client";

export default async function BarberServicesPage() {
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
        role: true,
        specialties: true,
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

  return (
    <BarberServicesClient 
      userId={dbUser.id}
      userName={dbUser.name}
      specialties={dbUser.specialties || []}
    />
  );
}
