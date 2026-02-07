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
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const barbershops = await db.barbershop.findMany({
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
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

// --- API Keys Management ---

export async function getApiKeys() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const keys = await db.apiKey.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, keys };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createApiKey(name: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Generate a simple key
        const key = "sk_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now().toString(36);

        const newKey = await db.apiKey.create({
            data: {
                name,
                key,
                isActive: true
            }
        });
        
        revalidatePath("/admin");
        return { success: true, key: newKey };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function revokeApiKey(id: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.apiKey.delete({
            where: { id }
        });
        
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Webhook Management ---

export async function getWebhooks() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const webhooks = await db.webhook.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, webhooks };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createWebhook(url: string, name: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Simple validation
        if (!url.startsWith("http")) {
             return { success: false, error: "URL inválida. Deve começar com http/https" };
        }

        const newWebhook = await db.webhook.create({
            data: {
                name,
                url,
                events: ["booking.created", "booking.cancelled", "booking.rescheduled"], // Default to all needed events
                secret: "whsec_" + Math.random().toString(36).substr(2, 9)
            }
        });
        
        revalidatePath("/admin");
        return { success: true, webhook: newWebhook };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteWebhook(id: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.webhook.delete({
            where: { id }
        });
        
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- User Management (Cascade Delete) ---

/**
 * Deleta um usuário e TODOS os dados relacionados (efeito cascata).
 * Isso inclui:
 * - Barbearia do usuário (se for proprietário)
 * - Todos os agendamentos da barbearia
 * - Todos os barbeiros da barbearia
 * - Todos os serviços da barbearia
 * - Todas as transações financeiras
 * - Todos os reviews
 * - Todos os cartões de fidelidade
 * - Sessões e contas do usuário
 */
export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    // Prevenir auto-exclusão
    if (session.user.id === userId) {
        return { success: false, error: "Você não pode excluir sua própria conta" };
    }

    try {
        // 1. Buscar usuário com barbearia
        const user = await db.user.findUnique({
            where: { id: userId },
            include: { Barbershop: true }
        });

        if (!user) {
            return { success: false, error: "Usuário não encontrado" };
        }

        console.log(`[ADMIN] Iniciando exclusão cascata do usuário ${user.email}`);

        // 2. Se tem barbearia, deletar tudo relacionado a ela
        if (user.Barbershop) {
            const shopId = user.Barbershop.id;
            console.log(`[ADMIN] Deletando barbearia ${shopId} e dados relacionados...`);

            // Deletar em ordem de dependência (filhos primeiro)
            await db.booking.deleteMany({ where: { barbershopId: shopId }});
            await db.barber.deleteMany({ where: { barbershopId: shopId }});
            await db.barbershopService.deleteMany({ where: { barbershopId: shopId }});
            await db.review.deleteMany({ where: { barbershopId: shopId }});
            await db.financialTransaction.deleteMany({ where: { barbershopId: shopId }});
            await db.stockItem.deleteMany({ where: { barbershopId: shopId }});
            await db.barbershopProduct.deleteMany({ where: { barbershopId: shopId }});
            await db.loyaltyCard.deleteMany({ where: { barbershopId: shopId }});
            await db.style.deleteMany({ where: { barbershopId: shopId }});
            
            // Deletar a barbearia
            await db.barbershop.delete({ where: { id: shopId }});
            console.log(`[ADMIN] Barbearia ${shopId} deletada`);
        }

        // 3. Deletar dados diretamente relacionados ao usuário
        await db.review.deleteMany({ where: { userId }});
        await db.loyaltyCard.deleteMany({ where: { userId }});
        await db.platformFeedback.deleteMany({ where: { userId }});
        await db.session.deleteMany({ where: { userId }});
        await db.account.deleteMany({ where: { userId }});

        // 4. Finalmente, deletar o usuário
        await db.user.delete({ where: { id: userId }});
        
        console.log(`[ADMIN] Usuário ${user.email} deletado com sucesso`);
        
        revalidatePath("/admin");
        return { 
            success: true, 
            deletedUser: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };

    } catch (error: any) {
        console.error("[ADMIN] Erro ao deletar usuário:", error);
        return { success: false, error: error.message };
    }
}

