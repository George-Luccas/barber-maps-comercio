"use server"

import { db } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  try {
    // 1. Validação básica
    if (!name || !email || !phone || !password) {
      return { success: false, error: "Todos os campos são obrigatórios!" };
    }

    // 2. Verificar se o utilizador já existe
    const userExists = await db.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return { success: false, error: "Este email já está registado!" };
    }

    // 3. Criptografar a senha (Segurança Máxima)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Salvar no Banco de Dados: Criar Usuário E Barbearia de forma ATÔMICA
    // Com a relação restaurada no schema, podemos usar Nested Write do Prisma.
    // Isso garante que se a barbearia falhar, o usuário não é criado.

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: email === "georgeluccas300@gmail.com" ? "ADMIN" : "BARBER",
        source: "BARBER_MAPS_COMERCIO",
        updatedAt: new Date(),
        Barbershop: {
          create: {
            name: `${name} Barber Shop`,
            address: "Endereço pendente",
            description: "Bem-vindo à sua barbearia! Configure seus dados em 'Minha Barbearia'.",
            imageUrl: "",
            phones: [phone],
            dailyGoal: 500.00
          }
        }
      }
    });

    revalidatePath("/");
    return { success: true };

  } catch (error) {
    console.error("ERRO AO REGISTAR:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: "Erro ao criar conta: " + msg };
  }
}