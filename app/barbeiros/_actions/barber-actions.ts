"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/_lib/auth";

export async function getBarbers(barbershopId: string) {
  try {
    const barbers = await db.barber.findMany({
      where: { barbershopId },
      orderBy: { name: 'asc' }
    });
    return barbers;
  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error);
    return [];
  }
}

export async function saveBarber(data: {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  barbershopId: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  try {
    if (data.id) {
      await db.barber.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          imageUrl: data.imageUrl,
        }
      });
    } else {
      await db.barber.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          imageUrl: data.imageUrl,
          barbershopId: data.barbershopId
        }
      });
    }
    revalidatePath("/barbeiros");
    revalidatePath("/barbearia");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar barbeiro:", error);
    return { success: false, error: "Erro ao salvar barbeiro" };
  }
}

export async function deleteBarber(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  try {
    await db.barber.delete({
      where: { id }
    });
    revalidatePath("/barbeiros");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar barbeiro:", error);
    return { success: false, error: "Erro ao deletar" };
  }
}
