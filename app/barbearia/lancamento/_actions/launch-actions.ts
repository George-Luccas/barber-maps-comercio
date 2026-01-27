"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function searchClients(term: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autorizado");

  if (!term || term.length < 3) return [];

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { phone: { contains: term, mode: "insensitive" } },
      ],
      role: "CLIENT"
    },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true
    }
  });

  return users;
}

export async function quickRegister(data: { name: string; phone: string; instagram?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  try {
    // Basic validation
    if (!data.name || !data.phone) {
      return { error: "Nome e telefone são obrigatórios" };
    }

    // Check if phone already exists
    const existingUser = await db.user.findFirst({
        where: {
            OR: [
                { phone: data.phone }
            ]
        }
    });

    if (existingUser) {
        return { error: "Usuário já existe com este telefone", user: existingUser };
    }

    // Generate a placeholder email based on phone since we don't ask for email anymore
    const emailToUse = `${data.phone.replace(/\D/g, '')}@sememail.com`;

    const newUser = await db.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: emailToUse,
        instagram: data.instagram,
        role: "CLIENT",
        password: "", // No password for quick registered users
        source: "BARBER_MAPS_COMERCIO",
      },
    });

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    return { error: "Erro ao criar cadastro" };
  }
}

export async function launchService(data: { 
    userId: string; 
    serviceId: string; 
    barberId?: string; 
    date?: Date; 
    barbershopId: string 
}) {
  const session = await auth();
  // We expect the caller to pass barbershopId, or we get it from session if the user is a manager/barber. 
  // However, for safety, let's trust the session's barbershopId if available, or the passed one if valid.
  
  if (!session?.user) return { error: "Não autorizado" };
  
  try {
    const service = await db.barbershopService.findUnique({
        where: { id: data.serviceId }
    });

    if (!service) return { error: "Serviço não encontrado" };

    const bookingDate = data.date || new Date();

    // 1. Create Booking (Completed)
    const booking = await db.booking.create({
        data: {
            barbershopId: data.barbershopId,
            serviceId: data.serviceId,
            userId: data.userId,
            barberId: data.barberId,
            date: bookingDate,
            status: "COMPLETED", // Using the Enum BookingStatus
            isSubscription: false, // Default
        }
    });

    // 2. Update LoyaltyCard
    // First, find or create
    let loyaltyCard = await db.loyaltyCard.findUnique({
        where: {
            userId_barbershopId: {
                userId: data.userId,
                barbershopId: data.barbershopId
            }
        }
    });

    if (!loyaltyCard) {
        loyaltyCard = await db.loyaltyCard.create({
            data: {
                id: crypto.randomUUID(),
                userId: data.userId,
                barbershopId: data.barbershopId,
                completedCuts: 0,
                currentPoints: 0,
                totalLifetimePoints: 0,
                tier: "BRONZE",
                updatedAt: new Date()
            }
        });
    }

    // Calculate new values
    const points = service.points || 10; // Default 10 if null
    const newCompletedCuts = loyaltyCard.completedCuts + 1;
    const newCurrentPoints = loyaltyCard.currentPoints + points;
    const newTotalPoints = loyaltyCard.totalLifetimePoints + points;

    // Recalculate Tier
    let newTier: "BRONZE" | "SILVER" | "GOLD" = "BRONZE";
    if (newTotalPoints >= 1000) newTier = "GOLD";
    else if (newTotalPoints >= 300) newTier = "SILVER";

    // Update Loyalty Card
    await db.loyaltyCard.update({
        where: { id: loyaltyCard.id },
        data: {
            completedCuts: newCompletedCuts,
            currentPoints: newCurrentPoints,
            totalLifetimePoints: newTotalPoints,
            tier: newTier,
            updatedAt: new Date()
        }
    });

    revalidatePath("/barbearia/lancamento");
    revalidatePath("/agenda");

    return { success: true, bookingId: booking.id };

  } catch (error) {
    console.error("Erro ao lançar serviço:", error);
    return { error: "Erro ao processar lançamento" };
  }
}

export async function getBarbersAndServices(barbershopId: string) {
    const barbers = await db.barber.findMany({
        where: { barbershopId }
    });
    const services = await db.barbershopService.findMany({
        where: { barbershopId, deletedAt: null }
    });
    return { barbers, services };
}
