
import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Auth Check
  const apiKey = await validateApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  // 2. Fetch Services and Barbers
  // We want to know which barbers perform which service, or just a list of services + list of barbers.
  // The schema has BarbershopService and Barber.
  // Bookings link Service + Barber.
  // A service usually belongs to the shop. All barbers in shop usually perform all services unless specified?
  // Current schema doesn't explicitly link Barber <-> Service (Many-to-Many).
  // So we assume all barbers in the shop can do the services.

  const [services, barbers] = await Promise.all([
    db.barbershopService.findMany({
      where: { barbershopId: id, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        priceInCents: true,
        points: true
      }
    }),
    db.barber.findMany({
      where: { barbershopId: id },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      }
    })
  ]);

  return NextResponse.json({
    services,
    barbers
  });
}
