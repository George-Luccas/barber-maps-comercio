
import { db } from "@/app/_lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { calculateServicePoints } from "@/app/_utils/loyalty";


export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 0. Security Check (API Key)
    const authHeader = request.headers.get("authorization");
    const API_SECRET = process.env.API_SECRET || "barber-secret-123"; // Fallback only for dev

    if (authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // 1. Find the booking and associated service
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        BarbershopService: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { message: "Booking already completed" },
        { status: 200 }
      );
    }


    // 2. Calculate points based on service name
    const points = calculateServicePoints(booking.BarbershopService.name, booking.BarbershopService.points || 10);


    // 3. Update Booking Status
    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED",
      },
    });

    // 4. Update Loyalty Card (ONLY IF NOT A SHADOW USER)
    const user = await db.user.findUnique({
        where: { id: booking.userId }
    });
    
    // Check if it's a shadow user
    const isShadowUser = user?.email.endsWith("@sememail.com");

    if (!isShadowUser) {
        let loyaltyCard = await db.loyaltyCard.findUnique({
        where: {
            userId_barbershopId: {
            userId: booking.userId,
            barbershopId: booking.barbershopId,
            },
        },
        });

        if (!loyaltyCard) {
        loyaltyCard = await db.loyaltyCard.create({
            data: {
                id: crypto.randomUUID(),
            userId: booking.userId,
            barbershopId: booking.barbershopId,
            completedCuts: 0,
            currentPoints: 0,
            totalLifetimePoints: 0,
            tier: "BRONZE",
            updatedAt: new Date(),
            },
        });
        }

        const newCompletedCuts = loyaltyCard.completedCuts + 1;
        const newCurrentPoints = loyaltyCard.currentPoints + points;
        const newTotalPoints = loyaltyCard.totalLifetimePoints + points;


    // Recalculate Tier
        let newTier: "BRONZE" | "SILVER" | "GOLD" = "BRONZE";
        if (newTotalPoints >= 1000) newTier = "GOLD";
        else if (newTotalPoints >= 300) newTier = "SILVER";

        await db.loyaltyCard.update({
        where: { id: loyaltyCard.id },
        data: {
            completedCuts: newCompletedCuts,
            currentPoints: newCurrentPoints,
            totalLifetimePoints: newTotalPoints,
            tier: newTier,
            updatedAt: new Date(),
        },
        });
    }

    // Revalidate paths that might show this data
    revalidatePath("/bookings");
    revalidatePath("/agenda");

    return NextResponse.json({
      message: "Booking completed successfully",
      pointsEarned: isShadowUser ? 0 : points,
      isShadowUser: isShadowUser,
      note: isShadowUser ? "User is shadow/placeholder, no points awarded." : "Points awarded."
    });
  } catch (error) {
    console.error("Error completing booking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
