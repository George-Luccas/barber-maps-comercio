"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";

export async function getBookings(barbershopId: string, dateStr?: string) {
  const session = await auth();
  
  if (!session?.user) return [];

  // Se não vier string, pega data de hoje em YYYY-MM-DD UTC ou Local Server
  // Melhor: se não vier, assume hoje.
  let targetDateStr = dateStr;
  if (!targetDateStr) {
      const now = new Date();
      targetDateStr = now.toISOString().split('T')[0]; // Fallback
  }

  // Cria data UTC a partir da string "YYYY-MM-DD"
  // Ao fazer new Date("2026-01-05"), em server side (Node), se for UTC, é 00:00 UTC.
  // Para garantir busca abrangente no dia, pegamos o start (00:00:00) e end (23:59:59) desse dia.
  
  const startOfDay = new Date(`${targetDateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${targetDateStr}T23:59:59.999Z`);

  // NOTA: Se o banco estiver salvando com -03:00, e buscarmos UTC, pode haver deslocamento.
  // Mas como funcionou no Desktop (que gera UTC implicitamente), manteremos a lógica UTC.
  // A diferença é que agora controlamos a string exata.

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
      clientName: booking.user?.name || "Cliente",
      serviceName: booking.BarbershopService?.name || "Serviço",
      time: booking.date?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || "--:--",
      
      // Lógica aprimorada de status
      status: (() => {
        if (booking.cancelledAt) return 'cancelado';
        
        const now = new Date();
        const bookingTime = new Date(booking.date);
        const endTime = new Date(bookingTime.getTime() + 45 * 60000); // Assume 45 min duração padrão
        
        if (now > endTime) return 'realizado';
        if (now >= bookingTime && now <= endTime) return 'em-atendimento';
        return 'pendente';
      })() // 'realizado' | 'pendente' | 'em-atendimento' | 'cancelado'
    }));

  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return [];
  }
}
