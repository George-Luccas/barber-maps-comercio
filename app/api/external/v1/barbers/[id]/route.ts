import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/external/v1/barbers/[id]
 * 
 * Returns details of a specific BARBER_PROMO user.
 * The consumer app can use this to display individual barber profiles.
 * 
 * Response includes:
 * - All barber info plus accountType marker
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth Check
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // 2. Fetch the barber
    const barber = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        specialties: true,
        yearsOfExperience: true,
        isAutonomous: true,
        workplaceName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    // 3. Check if this is a BARBER_PROMO user
    const isPromoBarber = barber.role === "BARBER_PROMO";

    // 4. Return with explicit markers
    return NextResponse.json({
      success: true,
      barber: {
        id: barber.id,
        name: barber.name,
        email: barber.email,
        phone: barber.phone,
        image: barber.image,
        bio: barber.bio,
        specialties: barber.specialties,
        yearsOfExperience: barber.yearsOfExperience,
        isAutonomous: barber.isAutonomous,
        workplaceName: barber.workplaceName,
        createdAt: barber.createdAt.toISOString(),
        // MARKERS for consumer app
        accountType: barber.role, // "BARBER_PROMO", "BARBER", "CLIENT", or "ADMIN"
        isPromoBarber: isPromoBarber, // Explicit boolean flag
        isOwner: barber.role === "BARBER", // True if this is a shop owner
      },
    });
  } catch (error) {
    console.error("API GET Barber Detail Error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}
