"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function confirmBooking(bookingId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    const booking = await db.booking.update({
      where: {
        id: bookingId,
      },
      data: {
          status: "CONFIRMED",
      }
    });

    // Webhook Trigger (Optional: trigger verification or update)
    if (booking) {
       await import("@/app/_lib/webhooks").then(mod => mod.triggerWebhooks("booking.confirmed" as any, booking));
    }

    revalidatePath("/barbearia");
    revalidatePath("/agenda");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao confirmar agendamento:", error);
    return { success: false, message: "Erro ao confirmar agendamento" };
  }
}
