
import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";
import { addMinutes, format, parse, isBefore, startOfDay, endOfDay, isEqual } from "date-fns";


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
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    if (!dateStr) {
      return NextResponse.json({ error: "Date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    // 2. Get Shop Config (Hours)
    const shop = await db.barbershop.findUnique({
      where: { id },
      select: {
        openingTime: true,
        closingTime: true,
        lunchStart: true,
        lunchEnd: true,
        isOpen: true,
      }
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (!shop.isOpen) {
       return NextResponse.json({ availableSlots: [], message: "Shop is closed" });
    }
    
    // Default hours if not set
    const startHour = shop.openingTime || "09:00";
    const endHour = shop.closingTime || "18:00";
    const serviceDuration = 45; // Default service duration (could be dynamic based on serviceId)

    // 3. Get Existing Bookings
    const targetDate = new Date(dateStr);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    const bookings = await db.booking.findMany({
      where: {
        barbershopId: id,
        date: {
          gte: start,
          lte: end,
        },
        status: {
          not: "CANCELLED"
        }
      },
      select: {
        date: true
      }
    });

    // 4. Generate Slots
    const slots: string[] = [];
    let currentTime = parse(startHour, "HH:mm", targetDate);
    const endTime = parse(endHour, "HH:mm", targetDate);
    
    // Lunch Parsers
    let lunchStart: Date | null = null;
    let lunchEnd: Date | null = null;
    if (shop.lunchStart && shop.lunchEnd) {
      lunchStart = parse(shop.lunchStart, "HH:mm", targetDate);
      lunchEnd = parse(shop.lunchEnd, "HH:mm", targetDate);
    }

    while (isBefore(currentTime, endTime)) {
      // Check Lunch
      let isLunch = false;
      if (lunchStart && lunchEnd) {
        if ((isBefore(currentTime, lunchEnd) && isBefore(lunchStart, addMinutes(currentTime, serviceDuration))) || isEqual(currentTime, lunchStart)) {
          isLunch = true;
        }
      }

      if (!isLunch) {
         // Check Bookings
         const isOccupied = bookings.some(booking => {
           const bookingDate = new Date(booking.date);
           return bookingDate.getUTCHours() === currentTime.getUTCHours() && bookingDate.getUTCMinutes() === currentTime.getUTCMinutes();
         });

         if (!isOccupied) {
           slots.push(format(currentTime, "HH:mm"));
         }
      }

      currentTime = addMinutes(currentTime, serviceDuration);
    }

    return NextResponse.json({
      date: dateStr,
      availableSlots: slots
    });
  } catch (error) {
    console.error("API Availability Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
