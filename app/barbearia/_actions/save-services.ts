"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function saveBarberServices(
  services: { name: string, price: number }[],
  barbershopName: string,
  imageUrl: string,
  horarios: { abertura: string, almocoInicio: string, almocoFim: string, fechamento: string }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Não autorizado");

    const userId = (session.user as any).id;

    // 1. Upsert da Barbearia
    // Usamos valores padrão para campos obrigatórios (address e description) 
    // para o banco não dar erro enquanto não configuramos o Google Maps.
    const barbershop = await db.barbershop.upsert({
      where: { managerId: userId },
      update: {
        name: barbershopName,
        imageUrl: imageUrl || null,
        openingTime: horarios.abertura,
        lunchStart: horarios.almocoInicio || null,
        lunchEnd: horarios.almocoFim || null,
        closingTime: horarios.fechamento,
      },
      create: {
        name: barbershopName,
        imageUrl: imageUrl || null,
        openingTime: horarios.abertura,
        lunchStart: horarios.almocoInicio || null,
        lunchEnd: horarios.almocoFim || null,
        closingTime: horarios.fechamento,
        address: "Endereço Pendente", // Campo obrigatório no seu Prisma
        description: "Barbearia configurada pelo painel", // Campo obrigatório no seu Prisma
        managerId: userId,
      },
    });

    // 2. Limpar serviços antigos
    await db.barbershopService.deleteMany({
      where: { barbershopId: barbershop.id }
    });

    // 3. Criar novos serviços
    if (services.length > 0) {
      await db.barbershopService.createMany({
        data: services.map(s => ({
          name: s.name,
          priceInCents: Math.round(s.price * 100),
          description: "Serviço profissional",
          imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500",
          barbershopId: barbershop.id
        }))
      });
    }

    revalidatePath("/barbearia");
    return { success: true };

  } catch (error) {
    console.error("ERRO NO BANCO:", error);
    throw new Error("Falha ao salvar no banco de dados");
  }
}