"use server"

import { db } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  // 1. Validação básica
  if (!name || !email || !phone || !password) {
    throw new Error("Todos os campos são obrigatórios!")
  }

  // 2. Verificar se o utilizador já existe
  const userExists = await db.user.findUnique({
    where: { email }
  })

  if (userExists) {
    throw new Error("Este email já está registado!")
  }

  // 3. Criptografar a senha (Segurança Máxima)
  const hashedPassword = await bcrypt.hash(password, 10)

  // 4. Salvar no Banco de Dados
  try {
    await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "BARBER", // Definimos como Barbeiro por padrão para o painel
        updatedAt: new Date(),
      }
    })

    // Limpa a cache para os dados aparecerem atualizados
    revalidatePath("/")
    
    return { success: true }
  } catch (error) {
    console.error("ERRO AO REGISTAR:", error)
    throw new Error("Erro ao criar conta. Tenta novamente.")
  }
}