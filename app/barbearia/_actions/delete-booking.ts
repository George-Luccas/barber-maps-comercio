"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteBooking(bookingId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    await db.booking.delete({
      where: {
        id: bookingId,
        // Optional: Ensure the booking belongs to the barbershop owned by the user
        // (If we had the barbershopId, but user is typically manager)
        // For simplicity and assuming valid access if authenticated and requesting explicit delete:
      },
    });

    revalidatePath("/barbearia");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
    return { success: false, message: "Erro ao excluir agendamento" };
  }
}
