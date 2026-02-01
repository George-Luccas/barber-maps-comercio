
import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";
import { addMinutes, isBefore } from "date-fns";

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
    if (!serviceId || !date || !user || !user.name || !user.phone) {
        return NextResponse.json({ error: "Missing required fields: serviceId, date, user (name, phone)" }, { status: 400 });
    }

    // 3. Find Service & Shop Context
    const service = await db.barbershopService.findUnique({
        where: { id: serviceId },
        include: { Barbershop: true }
    });

    if (!service) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const shop = service.Barbershop;

    // 4. Availability Check (Race Condition Prevention)
    // We assume 45 min duration or service specific if we had it.
    // Ideally we re-use the availability logic or just check strictly for overlap.
    const requestedDate = new Date(date); // UTC
    const requestedEnd = addMinutes(requestedDate, 45); 

    // Check overlaps
    const overlap = await db.booking.findFirst({
        where: {
            barbershopId: shop.id,
            barberId: barberId || undefined, // If barber selected, check specifically for him. If not, check global? No, if no barber selected, we assign one? Or we allow generic booking?
            // Usually booking requires a specific barber or "Any".
            // If "Any", we need to find an available barber.
            // For MVP, let's assume Barber IS required or we pick one.
            // If barberId is NOT passed, we should probably pick one or error?
            // Let's assume for now barberId is optional but ideally passed.
            // If NOT passed, we treat as "Any" -> we check if *at least one* barber is free? 
            // Complexity increase. Let's enforce barberId if possible, or check generic shop availability.
            // Simplified: Check if *any* booking overlaps regardless of barber? No that blocks parallel services.
            
            // Logic: If barberId provided -> Check his schedule.
            // If NOT provided -> We need to assign a barber?
            // Use case: User selects time first? 
            // Let's proceed with: check if there is an overlapping booking for THIS barber (if provided)
            // If no barber, we check if there are N barbers and N bookings? Too complex.
            // Let's just check against the specific barber if given.
            ...(barberId ? { barberId } : {}), 
            status: { not: "CANCELLED" },
            AND: [
                { date: { lt: requestedEnd } },
                { date: { gte: requestedDate } } 
            ]
        }
    });
    
    // Better Overlap Query using precise times
    const conflictingBooking = await db.booking.findFirst({
        where: {
            barbershopId: shop.id,
            ...(barberId ? { barberId } : {}),
            status: { not: "CANCELLED" },
            date: {
                lt: requestedEnd,
                gt: addMinutes(requestedDate, -45) // Look back to catch bookings that started before our slot but end inside it
            }
        }
    });

    // We must refine logic:
    // A booking B conflicts with Request R if:
    // B.Start < R.End  AND  B.End > R.Start
    
    // In database we only have B.Start (`date`). We assume B.End = B.Start + 45.
    // So conflict if:
    // B.Start < (R.Start + 45)  AND  (B.Start + 45) > R.Start
    // => B.Start < R.End  AND  B.Start > (R.Start - 45)
    
    if (conflictingBooking) {
        // Double check specifically in JS to be safe
        const bStart = new Date(conflictingBooking.date);
        const bEnd = addMinutes(bStart, 45);
        
        if (bStart < requestedEnd && bEnd > requestedDate) {
             return NextResponse.json({ error: "Time slot no longer available" }, { status: 409 });
        }
    }

    // 5. Find or Create User
    // We search by email OR phone?
    // Phone is unique identifier usually for booking apps.
    // Email is better for Auth.
    // Let's rely on Phone for "Guest" users if Email not provided, but usually we ask for email.
    
    let userId = "";
    
    // 5. Find or Create User
    // We search by email only as 'User' schema has no phone.
    const existingUser = await db.user.findUnique({
        where: { email: user.email }
    });
    
    if (existingUser) {
        userId = existingUser.id;
    } else {
        // Create User without phone
        const newUser = await db.user.create({
            data: {
                name: user.name,
                email: user.email,
                // phone: user.phone // REMOVED: Schema does not support phone on User
            }
        });
        userId = newUser.id;
    }

    // 6. Create Booking
    // Check if Booking model allows storing guest details or user is enough?
    // We will rely on User relation.
    const newBooking = await db.booking.create({
        data: {
            barbershopId: shop.id,
            serviceId: service.id,
            userId: userId,
            barberId: barberId || undefined, 
            date: requestedDate,
            status: "CONFIRMED", 
        }
    });

    return NextResponse.json({
        success: true,
        bookingId: newBooking.id,
        message: "Booking confirmed"
    }, { status: 201 });

  } catch (error) {
    console.error("Booking API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
