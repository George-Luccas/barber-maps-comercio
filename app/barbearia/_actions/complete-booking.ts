"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";
import { calculateServicePoints } from "@/app/_utils/loyalty";
import { triggerWebhooks } from "@/app/_lib/webhooks";

export async function completeBooking(bookingId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    // 1. Get Booking details first to calculate points
    const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: { BarbershopService: true }
    });

    if (!booking) {
        return { success: false, message: "Agendamento não encontrado" };
    }

    // 2. Calculate Points
    const points = calculateServicePoints(booking.BarbershopService.name, booking.BarbershopService.points || 10);

    // 3. Update Status
    const updatedBooking = await db.booking.update({
      where: {
        id: bookingId,
      },
      data: {
          status: "COMPLETED",
      },
      include: {
        Barbershop: true,
        BarbershopService: true,
        barber: true
      }
    });

    // 4. Trigger Webhook
    await triggerWebhooks("booking.completed", updatedBooking);

    // 5. Update Loyalty Card (Same logic as API)
    const user = await db.user.findUnique({
        where: { id: booking.userId }
    });
    
    // Check if it's a shadow user
    const isShadowUser = user?.email.endsWith("@sememail.com");

    if (!isShadowUser && user) {
        let loyaltyCard = await db.loyaltyCard.findUnique({
        where: {
            userId_barbershopId: {
            userId: booking.userId,
            barbershopId: booking.barbershopId,
            },
        },
        });

        if (!loyaltyCard) {
        loyaltyCard = await db.loyaltyCard.create({
            data: {
                id: crypto.randomUUID(),
            userId: booking.userId,
            barbershopId: booking.barbershopId,
            completedCuts: 0,
            currentPoints: 0,
            totalLifetimePoints: 0,
            tier: "BRONZE",
            updatedAt: new Date(),
            },
        });
        }

        const newCompletedCuts = loyaltyCard.completedCuts + 1;
        const newCurrentPoints = loyaltyCard.currentPoints + points;
        const newTotalPoints = loyaltyCard.totalLifetimePoints + points;

        let newTier: "BRONZE" | "SILVER" | "GOLD" = "BRONZE";
        if (newTotalPoints >= 1000) newTier = "GOLD";
        else if (newTotalPoints >= 300) newTier = "SILVER";

        await db.loyaltyCard.update({
        where: { id: loyaltyCard.id },
        data: {
            completedCuts: newCompletedCuts,
            currentPoints: newCurrentPoints,
            totalLifetimePoints: newTotalPoints,
            tier: newTier,
            updatedAt: new Date(),
        },
        });
    }

    revalidatePath("/barbearia");
    revalidatePath("/agenda");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao concluir agendamento:", error);
    return { success: false, message: "Erro ao concluir agendamento" };
  }
}
