"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";

export async function getClients() {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const barbershopId = (session.user as any).barbershopId;
  if (!barbershopId) return { error: "Barbearia não encontrada" };

  try {
    // Busca usuários que possuem um cartão fidelidade com esta barbearia
    // Isso garante que listamos apenas clientes que interagiram com esta unidade
    const loyaltyCards = await db.loyaltyCard.findMany({
      where: {
        barbershopId: barbershopId
      },
      include: {
        user: {
             select: {
                 id: true,
                 name: true,
                 phone: true,
                 email: true,
                 instagram: true,
                 role: true,
                 source: true
             }
        }
      },
      orderBy: {
         user: {
             name: 'asc'
         }
      }
    });

    const clients = loyaltyCards.map(card => ({
        id: card.user.id,
        name: card.user.name,
        phone: card.user.phone,
        email: card.user.email,
        instagram: card.user.instagram,
        totalCuts: card.completedCuts,
        tier: card.tier,
        currentPoints: card.currentPoints
    }));

    return { success: true, clients };

  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return { error: "Erro ao buscar lista de clientes" };
  }
}
