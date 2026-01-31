"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function cancelBooking(bookingId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    await db.booking.update({
      where: {
        id: bookingId,
      },
      data: {
          cancelledAt: new Date(),
      }
    });

    // Webhook Trigger
    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (booking) {
       await import("@/app/_lib/webhooks").then(mod => mod.triggerWebhooks("booking.cancelled", booking));
    }

    revalidatePath("/barbearia");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return { success: false, message: "Erro ao cancelar agendamento" };
  }
}
