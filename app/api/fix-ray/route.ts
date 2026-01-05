
import { NextResponse } from "next/server";
import { db } from "@/app/_lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = "rayfelipeoliveira.87@gmail.com";
    
    // 1. Check User (in main DB)
    const user = await db.user.findUnique({ 
        where: { email },
        include: { Barbershop: true }
    });
    
    if (!user) {
        return NextResponse.json({ success: false, message: "Usuário Ray não encontrado no banco de produção!" });
    }

    if (user.Barbershop) {
        return NextResponse.json({ success: true, message: `O usuário já tem barbearia: ${user.Barbershop.name}` });
    }

    // 2. Create Barbershop
    await db.barbershop.create({
        data: {
            name: "Ray Barber Shop",
            address: "Endereço pendente",
            description: "Bem-vindo à sua barbearia!",
            imageUrl: "",
            phones: ["65981227718"],
            dailyGoal: 500.00,
            managerId: user.id
        }
    });

    return NextResponse.json({ success: true, message: "Barbearia criada com sucesso para Ray!" });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
