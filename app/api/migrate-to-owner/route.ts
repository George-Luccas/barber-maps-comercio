import { auth } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verify user is BARBER_PROMO
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, phone: true, Barbershop: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.role !== "BARBER_PROMO") {
      return NextResponse.json({ error: "Apenas Barbeiros de Divulgação podem migrar" }, { status: 403 });
    }

    if (user.Barbershop) {
      return NextResponse.json({ error: "Você já possui uma barbearia" }, { status: 400 });
    }

    const body = await request.json();
    const { shopName, address, description, phone } = body;

    if (!shopName || !address) {
      return NextResponse.json({ error: "Nome e endereço são obrigatórios" }, { status: 400 });
    }

    // Create barbershop and update user role in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create barbershop
      const barbershop = await tx.barbershop.create({
        data: {
          name: shopName,
          address,
          description: description || "Minha barbearia",
          managerId: session.user.id,
          phones: phone ? [phone] : (user.phone ? [user.phone] : []),
          dailyGoal: 500.00,
          imageUrl: "",
        }
      });

      // Update user role to BARBER (owner)
      await tx.user.update({
        where: { id: session.user.id },
        data: { 
          role: "BARBER",
          // Clear BARBER_PROMO specific fields
          isAutonomous: false,
          workplaceName: null,
        }
      });

      return barbershop;
    });

    return NextResponse.json({ 
      success: true, 
      barbershopId: result.id,
      message: "Barbearia criada com sucesso!" 
    });
  } catch (error) {
    console.error("Error migrating to owner:", error);
    return NextResponse.json({ error: "Erro ao criar barbearia" }, { status: 500 });
  }
}
