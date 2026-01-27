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
            orderBy: {
                createdAt: 'desc'
            }
        });

        const barbershops = await db.barbershop.findMany({
            include: {
                manager: true,
                barbers: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return { success: true, users, barbershops };
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

export async function getDiscountStats() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const stats = await db.barbershop.findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        Booking: {
                            where: {
                                isWelcomeDiscount: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Format for UI
        const formattedStats = stats.map(shop => ({
            id: shop.id,
            name: shop.name,
            // @ts-ignore: Prisma types might correspond to old schema until generation
            discountCount: shop._count?.Booking || 0
        })).sort((a, b) => b.discountCount - a.discountCount); // Most discounts first

        return { success: true, stats: formattedStats };

    } catch (error: any) {
        console.error("Erro ao buscar estatisticas de desconto:", error);
        return { success: false, error: error.message };
    }
}
