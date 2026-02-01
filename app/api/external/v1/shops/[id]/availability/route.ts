
import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";
import { addMinutes, format, isBefore, isValid, parse, setHours, setMinutes } from "date-fns";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth Check
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const barberId = searchParams.get("barberId");
    
    // Default duration 45 min if not provided
    const durationParam = searchParams.get("duration");
    const serviceDuration = durationParam ? parseInt(durationParam) : 45;

    if (!dateStr) {
      return NextResponse.json({ error: "Date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    // 2. Get Shop Config
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
       return NextResponse.json({ 
         date: dateStr, 
         availableSlots: [], 
         message: "Shop is closed" 
       });
    }
    
    // Parse Opening/Closing Times
    // Strict Mode: If not configured, returns unavailable.
    if (!shop.openingTime || !shop.closingTime) {
         return NextResponse.json({ 
             date: dateStr, 
             availableSlots: [], 
             message: "Shop hours not configured" 
         });
    }

    const startHourConfig = shop.openingTime;
    const endHourConfig = shop.closingTime;

    // 3. Fetch Existing Bookings
    // Strategy: Fetch a wide range of bookings around the target date to ensure we catch everything regardless of Timezone shifts.
    // Logic: Target Date 00:00 UTC to Target Date 23:59 UTC (+/- 1 day buffer is safest but let's try standard day first).
    
    // We strictly assume the `dateStr` is the Local Date we want to book.
    // We need to find bookings that fall on this Local Date.
    // Since we don't know the exact TZ of the shop in DB (could be -3, -4, etc), 
    // we fetch bookings for the Date-window and then filter explicitly by Hour/Minute.
    
    const targetDateStart = new Date(`${dateStr}T00:00:00.000Z`);
    const targetDateEnd = new Date(`${dateStr}T23:59:59.999Z`);
    
    // Add 12h buffer just in case of weird TZ offsets
    const searchStart = addMinutes(targetDateStart, -12 * 60);
    const searchEnd = addMinutes(targetDateEnd, 12 * 60);

    const whereCondition: any = {
        barbershopId: id,
        date: {
          gte: searchStart,
          lte: searchEnd,
        },
        status: {
          not: "CANCELLED"
        }
    };

    if (barberId) {
        whereCondition.barberId = barberId;
    }

    const bookings = await db.booking.findMany({
      where: whereCondition,
      select: {
        date: true, // DateTime (UTC)
      }
    });

    // 4. Generate & Filter Slots
    // Base reference date for constructing slots
    const baseDate = new Date(`${dateStr}T00:00:00`); 
    // Note: This constructs a date in Local System Time of the Node process (Vercel is UTC usually).
    
    const [startH, startM] = startHourConfig.split(':').map(Number);
    const [endH, endM] = endHourConfig.split(':').map(Number);

    let currentTime = setMinutes(setHours(baseDate, startH), startM);
    const endTime = setMinutes(setHours(baseDate, endH), endM);
    
    // Lunch
    let lunchStart: Date | null = null;
    let lunchEnd: Date | null = null;
    if (shop.lunchStart && shop.lunchEnd) {
       const [lStartH, lStartM] = shop.lunchStart.split(':').map(Number);
       const [lEndH, lEndM] = shop.lunchEnd.split(':').map(Number);
       lunchStart = setMinutes(setHours(baseDate, lStartH), lStartM);
       lunchEnd = setMinutes(setHours(baseDate, lEndH), lEndM);
    }

    const availableSlots: string[] = [];

    while (isBefore(currentTime, endTime)) {
        const slotEnd = addMinutes(currentTime, serviceDuration);
        
        // A. Check Shop Closing
        if (isBefore(endTime, slotEnd)) {
            break; 
        }

        // B. Check Lunch Overlap
        let isDuringLunch = false;
        if (lunchStart && lunchEnd) {
             // Overlap: (StartA < EndB) and (EndA > StartB)
             if (isBefore(currentTime, lunchEnd) && isBefore(lunchStart, slotEnd)) {
                 isDuringLunch = true;
             }
        }

        // C. Check Booking Overlap
        let isOccupied = false;
        
        if (!isDuringLunch) {
            isOccupied = bookings.some(booking => {
                 // Convert Booking Date (UTC) to a "Time of Day" relative to our `baseDate`?
                 // or simply check timestamps.
                 // Booking Date is the start time.
                 const bStart = new Date(booking.date);
                 const bEnd = addMinutes(bStart, serviceDuration); // Should be booking duration but defaulting to service duration
                 
                 // We need to compare `currentTime` (Node Local/UTC) with `bStart` (UTC).
                 // If Node is UTC (Vercel), `currentTime` built from "2025-02-01T09:00:00" is 09:00 UTC.
                 // If I make a booking for "09:00", Prisma saves it as... ?
                 // If Client sends "2025-02-01T09:00:00.000Z", it is saved as such.
                 // So direct comparison works IF client sends UTC.
                 // Let's assume consistent UTC usage.
                 
                 // Overlap Logic
                 // (SlotStart < BookingEnd) && (SlotEnd > BookingStart)
                 // We use .getTime() to be safe constants
                 return (currentTime.getTime() < bEnd.getTime()) && (slotEnd.getTime() > bStart.getTime());
            });
        }

        if (!isDuringLunch && !isOccupied) {
            availableSlots.push(format(currentTime, "HH:mm"));
        }

        currentTime = addMinutes(currentTime, serviceDuration);
    }

    return NextResponse.json({
        date: dateStr,
        availableSlots,
        shopConfig: {
            open: startHourConfig,
            close: endHourConfig,
            lunch: shop.lunchStart ? `${shop.lunchStart}-${shop.lunchEnd}` : null
        }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Availability Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
