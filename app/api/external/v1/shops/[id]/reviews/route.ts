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

    // 1. Ensure User Exists (Upsert to handle both creation and updates safe)
    // Use a placeholder email if none provided, but try to keep it consistent
    const safeName = userName || `Visitante ${userId.slice(0, 4)}`;
    const safeEmail = `${userId}@external.com`; // Stable email based on ID

    await db.user.upsert({
        where: { id: userId },
        update: {
            name: safeName,
            image: userImage
        },
        create: {
            id: userId,
            name: safeName,
            email: safeEmail,
            image: userImage,
            role: "CLIENT"
        }
    });

    // 2. Upsert Review
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

    return NextResponse.json({ 
        success: true, 
        reviewId: review.id,
        message: "Avaliação registrada com sucesso" 
    });

  } catch (error) {
    console.error("API POST Review Error:", error);
    return NextResponse.json({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
