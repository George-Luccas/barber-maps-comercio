

import { db } from "@/app/_lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { receiptUrl, status } = body;

    // Validate if ID is provided
    if (!id) {
        return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // Update the booking
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        receiptUrl: receiptUrl, // Update receipt URL
        status: status,         // Update status (e.g., PENDING -> CONFIRMED)
      },
    });

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
