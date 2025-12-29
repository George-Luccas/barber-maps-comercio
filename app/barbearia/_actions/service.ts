"use server";

import { db } from "@/app/_lib/prisma";

export async function getBarbershopServices(barbershopId: string) {
  try {
    const services = await db.barbershopService.findMany({
      where: { barbershopId },
      orderBy: { name: 'asc' }
    });
    return { success: true, services };
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return { success: false, services: [] };
  }
}
