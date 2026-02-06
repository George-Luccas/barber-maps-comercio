import { auth } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { redirect } from "next/navigation";
import ForceLogout from "@/app/components/ForceLogout";
import BarberGalleryClient from "./_components/barber-gallery-client";

export default async function BarberGalleryPage() {
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

  // TODO: Fetch gallery images from a future BarberGallery model
  const galleryImages: { id: string; imageUrl: string; description: string }[] = [];

  return (
    <BarberGalleryClient 
      userId={dbUser.id}
      userName={dbUser.name}
      images={galleryImages}
    />
  );
}
