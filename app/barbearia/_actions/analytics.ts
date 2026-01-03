"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from "date-fns";

export interface DashboardMetrics {
  revenue: number;
  revenueGrowth: number;
  bookings: number;
  bookingsGrowth: number;
  newClients: number;
  newClientsGrowth: number;
  averageTicket: number;
  occupancyRate: number; // Percentage 0-100
}

export async function getDashboardMetrics(barbershopId: string): Promise<DashboardMetrics> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const now = new Date();
  const startCurrentMonth = startOfMonth(now);
  const endCurrentMonth = endOfMonth(now);
  
  const startLastMonth = startOfMonth(subMonths(now, 1));
  const endLastMonth = endOfMonth(subMonths(now, 1));

  // --- 1. REVENUE (Faturamento Total) ---
  // Soma de Agendamentos (assumindo que foram pagos/realizados) + Transações de Entrada (Venda de Produtos, etc)
  
  // Função helper para calcular receita em um período
  const calculateRevenue = async (start: Date, end: Date) => {
    // Busca agendamentos no período
    const bookings = await db.booking.findMany({
      where: {
        barbershopId,
        date: { gte: start, lte: end },
        // Consideramos 'realizado' ou data passada como faturado para simplificar, ou podemos filtrar status se houver um campo unificado
      },
      include: { BarbershopService: true }
    });

    const bookingsRevenue = bookings.reduce((acc, curr) => acc + (curr.BarbershopService?.priceInCents || 0), 0) / 100;

    // Busca transações financeiras extras (vanda de produtos, etc)
    const transactions = await db.financialTransaction.findMany({
      where: {
        barbershopId,
        date: { gte: start, lte: end },
        type: "INCOME"
      }
    });

    const transactionsRevenue = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return { total: bookingsRevenue + transactionsRevenue, count: bookings.length };
  };

  const currentMonthData = await calculateRevenue(startCurrentMonth, endCurrentMonth);
  const lastMonthData = await calculateRevenue(startLastMonth, endLastMonth);

  const revenue = currentMonthData.total;
  const lastRevenue = lastMonthData.total;
  const revenueGrowth = lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : 0;

  // --- 2. BOOKINGS COUNT ---
  const bookingsCount = currentMonthData.count;
  const lastBookingsCount = lastMonthData.count;
  const bookingsGrowth = lastBookingsCount > 0 ? ((bookingsCount - lastBookingsCount) / lastBookingsCount) * 100 : 0;

  // --- 3. NEW CLIENTS ---
  // Clientes criados neste mês (aproximação simples)
  // Idealmente, seria "Primeiro agendamento realizado neste mês"
  
  const countNewClients = async (start: Date, end: Date) => {
     return await db.user.count({
        where: {
            createdAt: { gte: start, lte: end },
            role: "CLIENT", // Assumindo que temos role CLIENT
            // Se quisermos ser estritos com a barbearia, precisaríamos verificar se o 1o agendamento foi nela,
            // mas como users são globais no schema atual, vamos simplificar para users criados.
        }
     });
  };

  const newClients = await countNewClients(startCurrentMonth, endCurrentMonth);
  const lastNewClients = await countNewClients(startLastMonth, endLastMonth);
  const newClientsGrowth = lastNewClients > 0 ? ((newClients - lastNewClients) / lastNewClients) * 100 : 0;

  // --- 4. TICKET MÉDIO ---
  // Faturamento Total / Número de Agendamentos (ou Vendas)
  // Se bookingsCount for 0, evita divisão por zero
  const averageTicket = bookingsCount > 0 ? revenue / bookingsCount : 0;

  // --- 5. OCCUPANCY RATE (Taxa de Ocupação) ---
  // Capacidade: (Horas Abertas x Cadeiras) vs (Horas Vendidas)
  // Estimativa: Supondo 10h por dia x 6 dias x 4 semanas = ~240 slots por barbeiro
  // Vamos buscar quantos barbeiros a loja tem.
  const barbersCount = await db.user.count({
      where: {
          Barbershop: { id: barbershopId } // Manager? 
          // O schema atual liga User -> Barbershop (manager). 
          // Se tivermos múltiplos barbeiros, precisaríamos de uma relação UserBarbershop ou similar.
          // Vou assumir 1 cadeira (Manager) + Capacidade Fixa por enquanto ou buscar users com role BARBER se houver relação.
      }
  }) || 1; // Fallback 1

  // Assumindo 26 dias úteis x 10 atendimentos
  const capacityPerBarber = 26 * 10; 
  const totalCapacity = barbersCount * capacityPerBarber;
  
  const occupancyRate = totalCapacity > 0 ? (bookingsCount / totalCapacity) * 100 : 0;


  return {
    revenue,
    revenueGrowth,
    bookings: bookingsCount,
    bookingsGrowth,
    newClients,
    newClientsGrowth,
    averageTicket,
    occupancyRate
  };
}

export async function getRevenueMix(barbershopId: string) {
  const session = await auth();
  if (!session?.user) return [];

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  // 1. Receita de Serviços (Agrupado por nome do serviço)
  const bookings = await db.booking.findMany({
    where: { barbershopId, date: { gte: start, lte: end } },
    include: { BarbershopService: true }
  });

  const serviceMix: Record<string, number> = {};
  bookings.forEach(b => {
    const name = b.BarbershopService?.name || "Serviço";
    const val = (b.BarbershopService?.priceInCents || 0) / 100;
    serviceMix[name] = (serviceMix[name] || 0) + val;
  });

  // 2. Receita de Produtos/Outros (FinancialTransaction INCOME)
  const transactions = await db.financialTransaction.findMany({
    where: { barbershopId, date: { gte: start, lte: end }, type: "INCOME" }
  });

  const productMix: Record<string, number> = {};
  transactions.forEach(t => {
     // Se tiver category, usa. Se não, "Produtos".
     const cat = t.category || "Venda de Produtos";
     productMix[cat] = (productMix[cat] || 0) + Number(t.amount);
  });

  // Merge
  const finalMix = [
    ...Object.entries(serviceMix).map(([name, value]) => ({ name, value, type: 'service' })),
    ...Object.entries(productMix).map(([name, value]) => ({ name, value, type: 'product' }))
  ];

  // Sort by value desc
  return finalMix.sort((a, b) => b.value - a.value);
}

export async function getOccupancyHeatmap(barbershopId: string) {
    // Mapa de Calor: Dias da Semana x Horários
    // Retorna array: { day: 'Seg', hour: 14, count: 5 }
    const session = await auth();
    if (!session?.user) return [];
  
    // Pegar histórico de 3 meses para ter dados suficientes
    const start = startOfMonth(subMonths(new Date(), 2)); 
    
    const bookings = await db.booking.findMany({
      where: { barbershopId, date: { gte: start } },
      select: { date: true }
    });
  
    const map: Record<string, number> = {};
    
    // Dias da semana em PT-BR
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
    bookings.forEach(b => {
       const date = new Date(b.date);
       const day = weekDays[date.getDay()];
       const hour = date.getHours();
       const key = `${day}-${hour}`;
       map[key] = (map[key] || 0) + 1;
    });
  
    // Formata para o gráfico (recharts scatter ou heatmap custom)
    // Vamos retornar lista flat
    return Object.entries(map).map(([key, count]) => {
        const [day, hourStr] = key.split('-');
        return { day, hour: parseInt(hourStr), count };
    });
}

export async function getWeeklyRevenue(barbershopId: string) {
  const session = await auth();
  if (!session?.user) return [];

  const days = [];
  const now = new Date();
  
  // Buscar dados dos últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    // Soma agendamentos
    const bookings = await db.booking.findMany({
      where: {
        barbershopId,
        date: { gte: d, lt: nextDay }
      },
      include: { BarbershopService: true }
    });

    const bookingsRevenue = bookings.reduce((acc, curr) => acc + (curr.BarbershopService?.priceInCents || 0), 0) / 100;

    // Soma transações financeiras extras
    const transactions = await db.financialTransaction.findMany({
      where: {
        barbershopId,
        date: { gte: d, lt: nextDay },
        type: "INCOME"
      }
    });

    const transactionsRevenue = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    days.push({
      day: weekDays[d.getDay()],
      amount: bookingsRevenue + transactionsRevenue,
      date: d.toISOString()
    });
  }

  return days;
}
