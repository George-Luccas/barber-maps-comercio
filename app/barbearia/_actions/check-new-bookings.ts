
"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";

export async function checkNewBookings(barbershopId: string, after: Date) {
  const session = await auth();
  if (!session?.user) return [];

  try {
    const newBookings = await db.booking.findMany({
      where: {
        barbershopId: barbershopId,
        createdAt: {
          gt: after
        }
      },
      include: {
        user: true,
        BarbershopService: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return newBookings.map(b => ({
      id: b.id,
      clientName: b.user?.name || "Cliente",
      serviceName: b.BarbershopService?.name || "Serviço",
      date: b.date?.toLocaleDateString('pt-BR') || "",
      time: b.date?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || "--:--",
      createdAt: b.createdAt
    }));
  } catch (error) {
    console.error("Erro ao verificar novos agendamentos:", error);
    return [];
  }
}
