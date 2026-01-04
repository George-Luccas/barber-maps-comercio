"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";

import { dbAuth } from "@/app/_lib/prisma-auth";

export async function getBookings(barbershopId: string, dateStr?: string) {
  const session = await auth();
  
  if (!session?.user) return [];

  let targetDateStr = dateStr;
  if (!targetDateStr) {
      const now = new Date();
      targetDateStr = now.toISOString().split('T')[0]; 
  }

  const startOfDay = new Date(`${targetDateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${targetDateStr}T23:59:59.999Z`);

  try {
    // 1. Busca agendamentos (tenta incluir user, mas se falhar, ok)
    let bookings: any[] = [];
    try {
        bookings = await db.booking.findMany({
            where: {
                barbershopId: barbershopId,
                date: { gte: startOfDay, lt: endOfDay }
            },
            include: { user: true, BarbershopService: true },
            orderBy: { date: 'asc' }
        });
    } catch {
        // Se falhar o include user (cross-db), busca sem
        bookings = await db.booking.findMany({
            where: {
                barbershopId: barbershopId,
                date: { gte: startOfDay, lt: endOfDay }
            },
            include: { BarbershopService: true },
            orderBy: { date: 'asc' }
        });
    }

    // 2. Coletar IDs de usuários que estão faltando (nome indefinido ou user null)
    // Se 'user' veio null ou vazio, precisaremos buscar no banco de Auth.
    // O booking tem 'userId' (campo escalar) mesmo se a relação 'user' for null?
    // User é optional na relação, mas userId deve existir no booking.
    
    // Type coercion para acessar userId se não estiver tipado no select padrão
    const bookingsWithMissingUser = bookings.filter(b => !b.user || !b.user.name);
    const missingUserIds = [...new Set(bookingsWithMissingUser.map(b => b.userId).filter(Boolean))] as string[];

    // 3. Buscar usuários no banco de Auth
    const userMap = new Map<string, string>(); // ID -> Name
    if (missingUserIds.length > 0) {
        try {
            const users = await dbAuth.user.findMany({
                where: { id: { in: missingUserIds } },
                select: { id: true, name: true }
            });
            users.forEach(u => {
                if(u.name) userMap.set(u.id, u.name);
            });
        } catch (authErr) {
            console.error("Erro ao buscar usuários no banco de Auth:", authErr);
        }
    }

    // 4. Mapear resultados juntando as informações
    return bookings.map(booking => {
        let clientName = booking.user?.name;
        
        // Se não tem nome, tenta pegar do map
        if (!clientName && booking.userId) {
            clientName = userMap.get(booking.userId);
        }

        return {
            id: booking.id,
            clientName: clientName || "Cliente",
            serviceName: booking.BarbershopService?.name || "Serviço",
            time: booking.date?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || "--:--",
            status: calculateStatus(booking)
        };
    });

  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return [];
  }
}

function calculateStatus(booking: any) {
    if (booking.cancelledAt) return 'cancelado';
    
    const now = new Date();
    const bookingTime = new Date(booking.date);
    const endTime = new Date(bookingTime.getTime() + 45 * 60000); 
    
    if (now > endTime) return 'realizado';
    if (now >= bookingTime && now <= endTime) return 'em-atendimento';
    return 'pendente';
}

