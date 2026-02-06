"use server"

import { db } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function registerUser(formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const phone = (formData.get("phone") as string)?.trim()
  const password = (formData.get("password") as string)?.trim()
  const accountType = (formData.get("accountType") as string) || "owner"
  const isAutonomous = formData.get("isAutonomous") === "true"
  const workplaceName = (formData.get("workplaceName") as string)?.trim()

  try {
    // 1. Validação básica
    if (!name || !email || !phone || !password) {
      return { success: false, error: "Todos os campos são obrigatórios!" };
    }

    // 2. Validação específica para Barbeiro-Divulgação
    if (accountType === "barber_promo" && !isAutonomous && !workplaceName) {
      return { success: false, error: "Informe o nome da barbearia onde trabalha!" };
    }

    // 3. Verificar se o utilizador já existe
    const userExists = await db.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return { success: false, error: "Este email já está registado!" };
    }

    // 4. Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Determinar role baseado no tipo de conta
    let userRole: "BARBER" | "BARBER_PROMO" | "ADMIN" = "BARBER";
    
    // Admin auto-assign
    if (email === "georgeluccas300@gmail.com") {
      userRole = "ADMIN";
    } else if (accountType === "barber_promo") {
      userRole = "BARBER_PROMO";
    }

    // 6. Criar usuário baseado no tipo de conta
    if (accountType === "owner" || userRole === "ADMIN") {
      // PROPRIETÁRIO: Criar usuário + Barbearia (comportamento original)
      await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: userRole,
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
    } else {
      // BARBEIRO-DIVULGAÇÃO: Criar apenas usuário (sem Barbershop)
      await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: "BARBER_PROMO",
          isAutonomous,
          workplaceName: isAutonomous ? null : workplaceName,
          updatedAt: new Date(),
        }
      });
    }

    revalidatePath("/");
    return { success: true };

  } catch (error) {
    console.error("ERRO AO REGISTAR:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: "Erro ao criar conta: " + msg };
  }
}