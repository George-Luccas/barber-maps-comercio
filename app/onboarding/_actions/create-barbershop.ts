"use server"

import { db } from "@/app/_lib/prisma"
import { auth } from "@/app/_lib/auth"
import { revalidatePath } from "next/cache"

export async function createBarbershop(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const name = (formData.get("name") as string).trim()
  const phone = (formData.get("phone") as string).trim()
  
  if (!name || !phone) {
    return { success: false, error: "Nome da barbearia e telefone são obrigatórios." };
  }

  try {
    // Verificar se já tem barbearia (race condition prevention)
    const existing = await db.barbershop.findUnique({
        where: { managerId: session.user.id }
    });

    if (existing) {
        return { success: false, error: "Você já possui uma barbearia!" };
    }

    await db.barbershop.create({
      data: {
        name,
        address: "Endereço pendente - Configure em Minha Barbearia",
        description: "Bem-vindo à sua nova barbearia!",
        phones: [phone],
        dailyGoal: 500.00,
        managerId: session.user.id,
        imageUrl: "", // Pode ser atualizado depois
        isOpen: true
      }
    });

    revalidatePath("/");
    return { success: true };

  } catch (error) {
    console.error("Erro ao criar barbearia:", error);
    return { success: false, error: "Erro ao criar barbearia." };
  }
}
