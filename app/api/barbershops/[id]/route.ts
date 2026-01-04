
import { db } from "@/app/_lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const barbershopId = params.id;

    if (!barbershopId) {
      return NextResponse.json(
        { error: "Barbershop ID is required" },
        { status: 400 }
      );
    }

    const barbershop = await db.barbershop.findUnique({
      where: {
        id: barbershopId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        imageUrl: true,
        phones: true,
        isOpen: true,
        openingTime: true,
        closingTime: true,
        lunchStart: true,
        lunchEnd: true,
        latitude: true,
        longitude: true,
        description: true,
      },
    });

    if (!barbershop) {
      return NextResponse.json(
        { error: "Barbershop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(barbershop);
  } catch (error) {
    console.error("Error fetching barbershop:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
