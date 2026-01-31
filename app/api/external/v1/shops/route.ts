
import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Auth Check
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all active shops
    // We only return shops that are not suspended
    const shops = await db.barbershop.findMany({
      where: {
        isSuspended: false,
      },
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        imageUrl: true,
        phones: true,
        city: true,
        state: true,
        isOpen: true,
        latitude: true,
        longitude: true,
        // For the listing, we usually don't need all specific relations like styles/products
        // to keep the payload size manageable.
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error("API GET Shops List Error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}
