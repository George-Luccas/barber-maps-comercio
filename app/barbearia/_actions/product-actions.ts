"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function getBarbershopProducts(barbershopId: string) {
    try {
        const products = await db.barbershopProduct.findMany({
            where: { barbershopId },
            orderBy: { name: 'asc' }
        });
        return { success: true, products };
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return { success: false, products: [], error: "Erro ao carregar produtos" };
    }
}

export async function saveBarbershopProduct(data: {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    description?: string;
    imageUrl?: string;
    barbershopId: string;
}) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Não autorizado" };

    try {
        if (data.id) {
            // Update
            await db.barbershopProduct.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    priceInCents: Math.round(data.price * 100),
                    quantity: data.quantity,
                    description: data.description,
                    imageUrl: data.imageUrl
                }
            });
        } else {
            // Create
            await db.barbershopProduct.create({
                data: {
                    name: data.name,
                    priceInCents: Math.round(data.price * 100),
                    quantity: data.quantity,
                    description: data.description || "",
                    imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=500", // Default drink image
                    barbershopId: data.barbershopId
                }
            });
        }

        revalidatePath("/barbearia");
        return { success: true };
    } catch (error: any) {
        console.error("Erro ao salvar produto:", error);
        return { success: false, error: error.message || "Erro ao salvar produto" };
    }
}

export async function deleteBarbershopProduct(id: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Não autorizado" };

    try {
        await db.barbershopProduct.delete({
            where: { id }
        });
        revalidatePath("/barbearia");
        return { success: true };
    } catch (error: any) {
        console.error("Erro ao deletar produto:", error);
        return { success: false, error: error.message || "Erro ao deletar produto" };
    }
}
