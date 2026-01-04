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

  // Ajuste do intervalo para Fuso de Brasilia (UTC-3)
  // O dia começa às 00:00:00 BRT -> 03:00:00 UTC
  // O dia termina às 23:59:59 BRT -> 02:59:59 UTC do dia seguinte
  const startOfDay = new Date(`${targetDateStr}T03:00:00.000Z`);
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(startOfDay.getHours() + 23);
  endOfDay.setMinutes(59);
  endOfDay.setSeconds(59);
  endOfDay.setMilliseconds(999);

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
    // Se o novo campo userName estiver preenchido, não precisamos buscar no AuthDB!
    const bookingsWithMissingUser = bookings.filter(b => (!b.user || !b.user.name) && !b.userName);
    const missingUserIds = [...new Set(bookingsWithMissingUser.map(b => b.userId).filter(Boolean))] as string[];

    // 3. Buscar usuários no banco de Auth (apenas para os que não têm userName salvo)
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
        // Prioridade: booking.userName > booking.user.name > AuthDB > "Cliente"
        let clientName = booking.userName || booking.user?.name;
        
        if (!clientName && booking.userId) {
            clientName = userMap.get(booking.userId);
        }

        // Ajuste manual para garantir horário correto (UTC-3) => O cliente reportou que AINDA está errado.
        // Se estava 09:00 e aparecia 10:00, e eu tirei 3h, deveria ter ido para 07:00?
        // Vamos tentar remover o ajuste manual e confiar APENAS no timeZone se o ambiente estiver limpo, 
        // ou investigar se o dado está salvo errado (ex: salvou 12:00 UTC achando que era 09:00, mas o display UTC-3 converte de novo).
        
        // REVERTENDO AJUSTE MANUAL E USANDO timezone 'America/Sao_Paulo' PURO
        // Se o banco guarda '2026-01-04T12:00:00Z', isso é 09:00 no Brasil.
        // Se usarmos timeZone: 'America/Sao_Paulo', ele deve mostrar 09:00.
        // Se estava mostrando 10:00, é porque estava interpretando como UTC-2 (DST antiga?) ou o dado estava '13:00Z'.
        
        // NOVO: Se tiver 'displayTime' (string 'HH:mm') salvo, usa ele e IGNORA conversões de data!
        let timeString = booking.displayTime;
        
        if (!timeString) {
            // Fallback para conversão de data se não tiver o horário por escrito
            timeString = new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Sao_Paulo'
            }).format(booking.date);
        }

        return {
            id: booking.id,
            clientName: clientName || "Cliente",
            serviceName: booking.BarbershopService?.name || "Serviço",
            time: timeString,
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

