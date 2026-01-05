
"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";

export interface BarberAnalytics {
    id: string;
    name: string;
    imageUrl: string | null;
    bookingsCount: number;
    transactionsCount: number;
    totalServices: number; // Sum of both
}

export async function getBarberAnalytics(barbershopId: string): Promise<BarberAnalytics[]> {
    const session = await auth();
    if (!session?.user) return [];

    try {
        // 1. Get all barbers
        const barbers = await db.barber.findMany({
            where: { barbershopId },
            orderBy: { name: 'asc' }
        });

        // 2. Aggregate stats for each barber
        const analytics = await Promise.all(barbers.map(async (barber) => {
            
            // Count Completed Bookings (Past date, not cancelled)
            const bookingsCount = await db.booking.count({
                where: {
                    barberId: barber.id,
                    cancelledAt: null,
                    date: { lt: new Date() } // Somente agendamentos passados contam como realizados
                }
            });

            // Count Financial Transactions (Manual entries)
            const transactionsCount = await db.financialTransaction.count({
                where: {
                    barberId: barber.id
                    // Podemos filtrar por type='INCOME' se quisermos apenas receitas,
                    // mas o pedido foi "lançamentos feito pelo caixa", que inclui tudo.
                    // Assumindo que queremos contar ATENDIMENTOS lançados, geralmente são INCOME.
                    // Mas para simplificar e atender "lançamentos", vou contar todos ou filtrar INCOME.
                    // Vou filtrar type: "INCOME" para focar em serviços prestados.
                    , type: "INCOME" 
                }
            });

            return {
                id: barber.id,
                name: barber.name,
                imageUrl: barber.imageUrl,
                bookingsCount,
                transactionsCount,
                totalServices: bookingsCount + transactionsCount
            };
        }));

        // Sort by total performance (descending)
        return analytics.sort((a, b) => b.totalServices - a.totalServices);

    } catch (error) {
        console.error("Erro ao buscar analytics dos barbeiros:", error);
        return [];
    }
}
