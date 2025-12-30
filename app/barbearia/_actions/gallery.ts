"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";

export async function getStyles(barbershopId: string) {
  try {
    const styles = await db.style.findMany({
      where: { barbershopId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, styles };
  } catch (error) {
    console.error("Erro ao buscar estilos:", error);
    return { success: false, error: "Erro ao buscar estilos" };
  }
}

export async function createStyle({
  name,
  imageUrl,
  barbershopId,
}: {
  name: string;
  imageUrl: string;
  barbershopId: string;
}) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Não autorizado" };

    // Se o ID não veio (pode acontecer se session estiver stale), tenta buscar
    let finalBarbershopId = barbershopId;
    
    if (!finalBarbershopId) {
       const user = await db.user.findUnique({
          where: { id: (session.user as any).id },
          include: { Barbershop: true }
       });
       if (user?.Barbershop) {
          finalBarbershopId = user.Barbershop.id;
       } else {
          return { success: false, error: "Configure sua Barbearia antes de salvar estilos!" };
       }
    }

    const style = await db.style.create({
      data: {
        name,
        imageUrl,
        barbershopId: finalBarbershopId,
      },
    });

    revalidatePath("/galeria-estilos");
    return { success: true, style };
  } catch (error) {
    console.error("Erro ao criar estilo:", error);
    return { success: false, error: "Erro ao salvar estilo" };
  }
}

export async function deleteStyle(styleId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Não autorizado" };

    await db.style.delete({
      where: { id: styleId },
    });

    revalidatePath("/galeria-estilos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar estilo:", error);
    return { success: false, error: "Erro ao deletar estilo" };
  }
}
