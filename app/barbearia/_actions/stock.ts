"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

// Verifique se existe a palavra "export" antes de cada função!

export async function createStockItem(data: { 
  name: string, 
  quantity: number, 
  minQuantity: number, 
  unit: string, 
  barbershopId: string 
}) {
  try {
    const newItem = await db.stockItem.create({
      data: {
        name: data.name,
        quantity: data.quantity,
        minQuantity: data.minQuantity,
        unit: data.unit,
        barbershopId: data.barbershopId,
      },
    });
    revalidatePath("/estoque");
    return { success: true, item: newItem };
  } catch (error: any) {
    console.error("Erro ao criar item de estoque:", error);
    return { success: false, error: error.message || "Erro desconhecido" };
  }
}

export async function getStockItems(barbershopId: string) {
  try {
    const items = await db.stockItem.findMany({
      where: { barbershopId },
      orderBy: { name: 'asc' }
    });
    return { success: true, items };
  } catch (error) {
    return { success: false, items: [] };
  }
}

// ESTA É A FUNÇÃO QUE ESTÁ DANDO ERRO DE IMPORTAÇÃO
export async function updateStockQuantity(itemId: string, increment: number) {
  try {
    const item = await db.stockItem.update({
      where: { id: itemId },
      data: {
        quantity: {
          increment: increment
        }
      }
    });
    revalidatePath("/estoque");
    return { success: true, item };
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error);
    return { success: false };
  }
}