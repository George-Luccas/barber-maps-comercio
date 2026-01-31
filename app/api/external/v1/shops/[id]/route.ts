
import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth Check
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // 2. Fetch Data
    const shop = await db.barbershop.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        imageUrl: true,
        phones: true,
        city: true,
        isOpen: true,
        latitude: true,
        longitude: true,
        photos: true,
        styles: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            priceInCents: true,
            quantity: true,
          }
        }
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Barbershop not found" }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("API GET Shop Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
