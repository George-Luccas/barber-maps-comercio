import { db } from "@/app/_lib/prisma";
import { NextResponse } from "next/server";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthorized = await validateApiKey(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: routeId } = await params;
    const body = await request.json();
    const { userId, rating, comment, userName, userImage, barbershopId: bodyShopId } = body;

    // Prioritize ID from body if sent, otherwise use route param
    const barbershopId = bodyShopId || routeId;

    if (!userId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert review
    // Note: This relies on the userId existing in Comercio or being handled.
    // To be more flexible for external apps, we could store externalUserId
    // but for now we follow the schema established.
    
    // We try to find a user or create a "shadow" user if it's from Barber Maps
    // but the simplest is to assume the userId sent matches or the relation is optional.
    // Since we added a mandatory user relation in schema, we must handle it.
    
    // Check if user exists, if not, create a placeholder to satisfy foreign key
    let user = await db.user.findUnique({ where: { id: userId } });
    
    if (!user) {
        // Fallback name if none provided
        const safeName = userName || `Visitante ${userId.slice(0, 4)}`;
        
        user = await db.user.create({
            data: {
                id: userId,
                name: safeName,
                email: `${userId}@external.com`, // Placeholder email
                image: userImage,
                role: "CLIENT"
            }
        });
    }

    const review = await db.review.upsert({
      where: {
        userId_barbershopId: {
          userId,
          barbershopId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId,
        barbershopId,
        rating,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("API POST Review Error:", error);
    return NextResponse.json({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
