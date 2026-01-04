"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function saveBarberServices(
  services: { name: string, price: number }[],
  barbershopName: string,
  imageUrl: string,
  horarios: { abertura: string, almocoInicio: string, almocoFim: string, fechamento: string },
  photos: string[] = [],
  location?: { latitude: number | null, longitude: number | null }
) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Não autorizado");

    const userId = (session.user as any).id;

    const userExists = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.error(`Tentativa de salvamento para usuário inexistente: ${userId}`);
      throw new Error("Usuário não encontrado. Faça login novamente.");
    }

    // Sanitize inputs
    const safeLatitude = (location?.latitude !== null && location?.latitude !== undefined && !isNaN(location.latitude)) ? location.latitude : null;
    const safeLongitude = (location?.longitude !== null && location?.longitude !== undefined && !isNaN(location.longitude)) ? location.longitude : null;
    
    // 1. Upsert da Barbearia
    const barbershop = await db.barbershop.upsert({
      where: { managerId: userId },
      update: {
        name: barbershopName,
        imageUrl: imageUrl || null,
        photos: photos, // Atualiza a galeria
        openingTime: horarios.abertura,
        lunchStart: horarios.almocoInicio || null,
        lunchEnd: horarios.almocoFim || null,
        closingTime: horarios.fechamento,
        latitude: safeLatitude,
        longitude: safeLongitude,
      },
      create: {
        name: barbershopName,
        imageUrl: imageUrl || null,
        photos: photos,
        openingTime: horarios.abertura,
        lunchStart: horarios.almocoInicio || null,
        lunchEnd: horarios.almocoFim || null,
        closingTime: horarios.fechamento,
        latitude: safeLatitude,
        longitude: safeLongitude,
        address: "Endereço Pendente", 
        description: "Barbearia configurada pelo painel",
        managerId: userId,
      },
    });

    // 2. Limpar serviços antigos
    await db.barbershopService.deleteMany({
      where: { barbershopId: barbershop.id }
    });

    // 3. Criar novos serviços
    if (services.length > 0) {
      // Filter out invalid services
      const validServices = services.filter(s => s.name && !isNaN(s.price));
      
      if (validServices.length > 0) {
        await db.barbershopService.createMany({
          data: validServices.map(s => ({
            name: s.name,
            priceInCents: Math.round(s.price * 100),
            description: "Serviço profissional",
            imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500",
            barbershopId: barbershop.id
          }))
        });
      }
    }

    revalidatePath("/barbearia");
    revalidatePath("/financeiro"); 
    revalidatePath("/"); // Home para ver logo/nome atualizados
    revalidatePath("/galeria"); // Se houver
    
    console.log(`Configurações da barbearia ${barbershop.id} salvas com sucesso.`);
    return { success: true };

  } catch (error: any) {
    console.error("ERRO CRÍTICO NO SALVAMENTO:", error);
    const errorMessage = error?.message || "Erro desconhecido no banco de dados";
    return { success: false, error: errorMessage };
  }
}