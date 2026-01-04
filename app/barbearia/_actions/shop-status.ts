"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleShopStatus(barbershopId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { success: false, message: "Não autorizado" };
  }

  try {
    const shop = await db.barbershop.findUnique({
        where: { id: barbershopId },
        select: { isOpen: true }
    });

    if (!shop) throw new Error("Barbearia não encontrada");

    const newStatus = !shop.isOpen;

    await db.barbershop.update({
      where: {
        id: barbershopId,
      },
      data: {
        isOpen: newStatus,
      },
    });

    revalidatePath("/");
    
    return { success: true, newStatus };
  } catch (error: any) {
    console.error("Erro ao alterar status:", error);
    // Retorna a mensagem exata do erro para debug
    return { success: false, message: error.message || "Erro desconhecido ao alterar status" };
  }
}
