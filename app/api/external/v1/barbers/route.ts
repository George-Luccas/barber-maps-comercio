import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/external/v1/barbers
 * 
 * Returns a list of all barbers with role BARBER_PROMO (Barbeiro-Divulgação).
 * These are individual barbers promoting their work, not barbershop owners.
 * 
 * Response includes:
 * - id: User ID
 * - name: Barber name
 * - image: Profile image URL
 * - phone: Contact phone
 * - bio: Barber biography
 * - specialties: Array of specialties (e.g., "Degradê", "Barba")
 * - isAutonomous: true if working independently, false if employed
 * - workplaceName: Name of barbershop where they work (if not autonomous)
 * - accountType: Always "BARBER_PROMO" for these barbers
 */
export async function GET(request: Request) {
  try {
    // 1. Auth Check
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse query params for optional filters
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const autonomous = searchParams.get("autonomous");
    const specialty = searchParams.get("specialty");

    // 3. Build where clause
    const whereClause: any = {
      role: "BARBER_PROMO",
    };

    // Filter by autonomous status if specified
    if (autonomous === "true") {
      whereClause.isAutonomous = true;
    } else if (autonomous === "false") {
      whereClause.isAutonomous = false;
    }

    // Filter by specialty if specified
    if (specialty) {
      whereClause.specialties = {
        has: specialty,
      };
    }

    // 4. Fetch all BARBER_PROMO users
    const barbers = await db.user.findMany({
      where: whereClause,
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
        createdAt: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    // 5. Map to response format with explicit accountType marker
    const response = barbers.map(barber => ({
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
      // IMPORTANT: This marker tells the consumer app this is a promo barber
      accountType: "BARBER_PROMO",
      isPromoBarber: true, // Additional explicit boolean flag
    }));

    return NextResponse.json({
      success: true,
      count: response.length,
      barbers: response,
    });
  } catch (error) {
    console.error("API GET Promo Barbers Error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}
