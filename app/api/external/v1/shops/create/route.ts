import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/external/v1/shops
 * 
 * Creates a new barbershop for a BARBER_PROMO user (upgrading them to BARBER/owner).
 * This is called by the consumer app when a promotional barber wants to become an owner.
 * 
 * Request body:
 * - userId: ID of the BARBER_PROMO user who is creating the shop
 * - name: Shop name
 * - address: Shop address
 * - description: Shop description (optional)
 * - phone: Contact phone (optional)
 * - city: City (optional)
 * - state: State (optional)
 * - latitude: Latitude for map (optional)
 * - longitude: Longitude for map (optional)
 * 
 * Response:
 * - The created barbershop object with the user info
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Auth Check
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      userId, 
      name, 
      address, 
      description, 
      phone,
      city,
      state,
      latitude,
      longitude 
    } = body;

    // 2. Validate required fields
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }

    // 3. Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true,
        phone: true,
        role: true, 
        Barbershop: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Check if user already has a barbershop
    if (user.Barbershop) {
      return NextResponse.json({ 
        error: "User already has a barbershop",
        barbershopId: user.Barbershop.id
      }, { status: 409 });
    }

    // 5. Create barbershop and update user role in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the barbershop
      const barbershop = await tx.barbershop.create({
        data: {
          name,
          address,
          description: description || `Barbearia ${name}`,
          managerId: userId,
          phones: phone ? [phone] : (user.phone ? [user.phone] : []),
          city: city || null,
          state: state || null,
          latitude: latitude || null,
          longitude: longitude || null,
          imageUrl: "",
          dailyGoal: 500.00,
        }
      });

      // Update user role to BARBER (owner) if they were BARBER_PROMO
      if (user.role === "BARBER_PROMO") {
        await tx.user.update({
          where: { id: userId },
          data: { 
            role: "BARBER",
            // Clear promo-specific fields
            isAutonomous: false,
            workplaceName: null,
          }
        });
      }

      return barbershop;
    });

    console.log(`[API] Created barbershop ${result.id} for user ${userId}`);

    return NextResponse.json({
      success: true,
      barbershop: {
        id: result.id,
        name: result.name,
        address: result.address,
        description: result.description,
        phones: result.phones,
        city: result.city,
        state: result.state,
        latitude: result.latitude,
        longitude: result.longitude,
      },
      user: {
        id: userId,
        role: "BARBER", // Updated role
        isOwner: true,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("API POST Create Shop Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
