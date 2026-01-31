import { db } from "@/app/_lib/prisma";
import { validateApiKey } from "@/app/api/external/v1/_middleware/auth";
import { NextResponse } from "next/server";
import { triggerWebhooks } from "@/app/_lib/webhooks";

export async function POST(request: Request) {
  // 1. Auth Check
  const apiKey = await validateApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      barbershopId, 
      serviceId, 
      barberId, 
      date, // ISO String
      clientName,
      clientEmail,
      clientPhone 
    } = body;

    if (!barbershopId || !serviceId || !date || !clientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Handle User (Shadow User Pattern)
    // We try to find a user by email. If not found, create one.
    // If no email, we can't create a unique User easily without violating schema (email is unique).
    // Use a generated email if missing? -> "phone@sememail.com"
    
    let emailToUse = clientEmail;
    if (!emailToUse) {
       // Clean phone for ID
       const phoneKey = clientPhone ? clientPhone.replace(/\D/g, '') : "no-phone-" + Date.now();
       emailToUse = `${phoneKey}@sememail.com`;
    }

    let user = await db.user.findUnique({
      where: { email: emailToUse }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          name: clientName,
          email: emailToUse,
          phone: clientPhone,
          // role default is CLIENT/BARBER in schema? default is BARBER in schema line 198? 
          // Wait, schema says: role UserRole @default(BARBER). THIS IS A BUG/RISK in existing schema!
          // New users created this way will be BARBERs?
          // We must explicit set role to CLIENT.
          role: "CLIENT"
        }
      });
    }

    // 3. Create Booking
    const booking = await db.booking.create({
      data: {
        barbershopId,
        serviceId,
        barberId,
        userId: user.id,
        userName: clientName, // Redundant but good for display if user table changes
        date: new Date(date),
        status: "CONFIRMED",
        // origin: "APP_MAPS" // Not in schema yet, skipping
      }
    });

    // 4. Trigger Webhook
    await triggerWebhooks("booking.created", booking);

    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    console.error("LinkAPI Create Booking Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
