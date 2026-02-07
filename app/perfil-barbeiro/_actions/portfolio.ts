"use server"

import { db } from "@/app/_lib/prisma"
import { auth } from "@/app/_lib/auth"
import { revalidatePath } from "next/cache"

export async function getPortfolioItems() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return []
  }

  try {
    const portfolio = await db.barberPortfolio.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })
    return portfolio
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return []
  }
}

export async function addPortfolioItem(data: { imageUrl: string, description?: string }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await db.barberPortfolio.create({
      data: {
        userId: session.user.id,
        imageUrl: data.imageUrl,
        description: data.description,
      }
    })
    
    revalidatePath("/perfil-barbeiro")
    return { success: true }
  } catch (error) {
    console.error("Error adding portfolio item:", error)
    return { success: false, error: "Failed to add item" }
  }
}

export async function deletePortfolioItem(id: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await db.barberPortfolio.delete({
      where: { 
        id,
        userId: session.user.id // Ensure ownership
      }
    })
    
    revalidatePath("/perfil-barbeiro")
    return { success: true }
  } catch (error) {
    console.error("Error deleting portfolio item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}
