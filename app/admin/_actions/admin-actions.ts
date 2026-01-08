"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function getAdminDashboardData() {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const users = await db.user.findMany({
            include: {
                Barbershop: {
                    include: {
                        barbers: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { success: true, users };
    } catch (error: any) {
        console.error("Erro ao buscar dados do admin:", error);
        return { success: false, error: error.message };
    }
}

export async function toggleBarbershopSuspension(barbershopId: string) {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const shop = await db.barbershop.findUnique({
             where: { id: barbershopId },
             select: { isSuspended: true }
        });

        if (!shop) return { success: false, error: "Barbearia não encontrada" };

        const updatedShop = await db.barbershop.update({
            where: { id: barbershopId },
            data: {
                isSuspended: !shop.isSuspended
            }
        });

        revalidatePath("/admin");
        return { success: true, isSuspended: updatedShop.isSuspended };

    } catch (error: any) {
        console.error("Erro ao alterar status:", error);
        return { success: false, error: error.message };
    }
}
