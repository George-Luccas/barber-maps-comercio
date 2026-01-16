"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

interface CreateBookingParams {
    barbershopId: string;
    serviceId: string;
    userId: string;
    date: Date;
    barberId?: string;
    userName?: string;
    isWelcomeDiscount?: boolean;
}

export async function createBookingWithDiscount(params: CreateBookingParams) {
    try {
        const { barbershopId, serviceId, userId, date, barberId, userName, isWelcomeDiscount } = params;

        // 1. Validate if user exists (optional, depending on strictness)
        // 2. Validate service exists
        const service = await db.barbershopService.findUnique({ where: { id: serviceId } });
        if (!service) return { success: false, error: "Serviço não encontrado" };

        // 3. Create Booking
        const booking = await db.booking.create({
            data: {
                barbershopId,
                serviceId,
                userId,
                date,
                barberId,
                userName,
                isWelcomeDiscount: isWelcomeDiscount || false, 
                // status defaults to 'pendente' implicitly by not having cancelledAt
            }
        });

        revalidatePath(`/barbearia`);
        revalidatePath(`/agenda`);

        return { success: true, bookingId: booking.id };

    } catch (error: any) {
        console.error("Erro ao criar agendamento:", error);
        return { success: false, error: error.message };
    }
}
