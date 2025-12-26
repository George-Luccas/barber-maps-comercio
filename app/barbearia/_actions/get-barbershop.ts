"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";

export async function getBarbershopData() {
  const session = await auth();
  
  if (!session?.user) return null;

  // Pegamos o ID do usuário logado
  const userId = (session.user as any).id;

  try {
    return await db.barbershop.findUnique({
      where: { 
        managerId: userId 
      },
      include: {
        services: true,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar barbearia:", error);
    return null;
  }
}