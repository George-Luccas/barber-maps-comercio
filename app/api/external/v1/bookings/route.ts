
import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";
import { addMinutes, isBefore } from "date-fns";
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
    try {
        const apiKey = await validateApiKey(request);
        if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });

        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400, headers: corsHeaders });
        }

        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ bookings: [] }, { status: 200, headers: corsHeaders });
        }

        const bookings = await db.booking.findMany({
            where: { userId: user.id },
            include: {
                Barbershop: {
                    select: { name: true, address: true, imageUrl: true }
                },
                BarbershopService: {
                    select: { name: true, priceInCents: true }
                },
                barber: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        const formattedBookings = bookings.map(b => ({
            id: b.id,
            date: b.date,
            status: b.status,
            barbershopName: b.Barbershop.name,
            serviceName: b.BarbershopService?.name || "Serviço",
            price: (b.BarbershopService?.priceInCents || 0) / 100,
            barberName: b.barber?.name || null
        }));

        return NextResponse.json(formattedBookings, { status: 200, headers: corsHeaders });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500, headers: corsHeaders });
    }
}

export async function POST(request: Request) {
  try {
    // 1. Auth Check
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId, barberId, date, user } = body;

    // 2. Validation
    const missingFields = [];
    if (!serviceId) missingFields.push("serviceId");
    if (!date) missingFields.push("date");
    if (!user) {
        missingFields.push("user");
    } else {
        if (!user.name) missingFields.push("user.name");
        // user.email is used for lookup but name is required for creation. 
        // We should explicitly check email if it's critical, but code creates user with name+email.
        // If email missing, we can't look up.
        if (!user.email) missingFields.push("user.email");
    }

    if (missingFields.length > 0) {
        return NextResponse.json({ 
            error: `Missing required fields: ${missingFields.join(", ")}`,
            received: body 
        }, { status: 400, headers: corsHeaders });
    }

    // 3. Find Service & Shop Context
    const service = await db.barbershopService.findUnique({
        where: { id: serviceId },
        include: { Barbershop: true }
    });

    if (!service) {
        return NextResponse.json({ error: "Service not found" }, { status: 404, headers: corsHeaders });
    }

    const shop = service.Barbershop;

    // 4. Availability Check (Race Condition Prevention)
    const requestedDate = new Date(date); // UTC
    const requestedEnd = addMinutes(requestedDate, 45); 

    const conflictingBooking = await db.booking.findFirst({
        where: {
            barbershopId: shop.id,
            ...(barberId ? { barberId } : {}),
            status: { not: "CANCELLED" },
            date: {
                lt: requestedEnd,
                gt: addMinutes(requestedDate, -45) 
            }
        }
    });

    if (conflictingBooking) {
        const bStart = new Date(conflictingBooking.date);
        const bEnd = addMinutes(bStart, 45);
        
        if (bStart < requestedEnd && bEnd > requestedDate) {
             return NextResponse.json({ error: "Time slot no longer available" }, { status: 409, headers: corsHeaders });
        }
    }

    // 5. Find or Create User
    let userId = "";
    const existingUser = await db.user.findUnique({
        where: { email: user.email }
    });
    
    if (existingUser) {
        userId = existingUser.id;
    } else {
        const newUser = await db.user.create({
            data: {
                name: user.name,
                email: user.email,
            }
        });
        userId = newUser.id;
    }

    // 6. Create Booking
    const newBooking = await db.booking.create({
        data: {
            barbershopId: shop.id,
            serviceId: service.id,
            userId: userId,
            barberId: barberId || undefined, 
            date: requestedDate,
            status: "PENDING", 
        }
    });

    return NextResponse.json({
        success: true,
        bookingId: newBooking.id,
        message: "Booking confirmed"
    }, { status: 201, headers: corsHeaders });

  } catch (error) {
    console.error("Booking API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
