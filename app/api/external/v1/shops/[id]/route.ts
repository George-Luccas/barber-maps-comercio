
import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth Check (move before params to fail fast)
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log(`[DEBUG] API GET Shop request for ID: ${id}`);

    // 2. Fetch Data
    try {
      let shop = null;
      try {
        shop = await db.barbershop.findUnique({
          where: { id },
          include: {
            BarbershopService: {
              where: { deletedAt: null }
            },
            barbers: true,
            products: true,
            styles: true,
          }
        });
      } catch (e) {
        console.log(`[DEBUG] Shop Detail: ID ${id} is likely not a UUID. Proceeding to name fallback.`);
        shop = null;
      }

      // 3. Fallback: Search by Name if not found by UUID
      // This helps if the client app is accidentally sending a slugified name or partial name
      if (!shop) {
        console.log(`[DEBUG] Shop not found by ID. Trying name fallback for: ${id}`);
        shop = await db.barbershop.findFirst({
          where: { 
            OR: [
              { name: { contains: id, mode: 'insensitive' } },
              { name: { contains: id.replace(/-/g, ' '), mode: 'insensitive' } }
            ]
          },
          include: {
            BarbershopService: {
              where: { deletedAt: null }
            },
            barbers: true,
            products: true,
            styles: true,
          }
        });
      }

      if (!shop) {
        console.warn(`[DEBUG] Barbershop not found for ID: ${id}`);
        return NextResponse.json({ error: "Barbershop not found" }, { status: 404 });
      }

      // 3. Get Ratings and Reviews (New Migration)
      const reviewsData = await db.review.findMany({
        where: { barbershopId: shop.id },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      const ratingCount = reviewsData.length;
      const ratingAverage = ratingCount > 0 
        ? parseFloat((reviewsData.reduce((acc: number, r: any) => acc + r.rating, 0) / ratingCount).toFixed(1))
        : 0;

      return NextResponse.json({
        ...shop,
        pixKey: shop.pixKey, // Explicitly exposed for external payment integration
        rating: {
          average: ratingAverage,
          count: ratingCount,
        },
        reviews: reviewsData
      });
    } catch (dbError) {
      console.error(`[DEBUG] Database error fetching shop ${id}:`, dbError);
      throw dbError; // rethrow to be caught by outer catch
    }
  } catch (error) {
    console.error("API GET Shop Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error),
      path: `shops/${params?.id}`
    }, { status: 500 });
  }
}
