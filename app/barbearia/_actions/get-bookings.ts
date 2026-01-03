"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";

export async function getBookings(barbershopId: string, date?: Date) {
  const session = await auth();
  
  if (!session?.user) return [];

  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const bookings = await db.booking.findMany({
      where: {
        barbershopId: barbershopId,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        }
      },
      include: {
        user: true,
        BarbershopService: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    return bookings.map(booking => ({
      id: booking.id,
      clientName: booking.user.name,
      serviceName: booking.BarbershopService.name,
      time: booking.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: booking.date < new Date() ? 'realizado' : 'pendente' // Lógica simplificada de status
    }));

  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return [];
  }
}
