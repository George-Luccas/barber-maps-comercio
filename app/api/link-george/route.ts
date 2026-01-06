
import { NextResponse } from "next/server";
import { db } from "@/app/_lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = "georgeluccas300@gmail.com";
    
    // 1. Check User
    const user = await db.user.findUnique({
        where: { email },
        include: { Barbershop: true }
    });
    
    if (!user) {
        return NextResponse.json({ success: false, message: "Usuário George não encontrado em Produção!" });
    }

    // 2. Check User's CURRENT Barbershop (Automatic one)
    let autoShopId = null;
    if (user.Barbershop) {
        // If he already owns Polaco, stop.
        if (user.Barbershop.name.toLowerCase().includes("polaco")) {
             return NextResponse.json({ success: true, message: "Usuário já é dono da Polaco Barbearia!" });
        }
        autoShopId = user.Barbershop.id;
    }

    // 3. Find Polaco
    const targetShop = await db.barbershop.findFirst({
        where: { name: { contains: "Polaco", mode: 'insensitive' } }
    });

    if (!targetShop) {
        return NextResponse.json({ success: false, message: "Barbearia 'Polaco' não encontrada em Produção!" });
    }

    // 4. Delete Automatic Shop if exists
    if (autoShopId) {
        // Ensure we are not deleting Polaco by mistake (checked above, but double check)
        if (autoShopId !== targetShop.id) {
             await db.barbershop.delete({ where: { id: autoShopId } });
        }
    }

    // 5. Link Polaco
    await db.barbershop.update({
        where: { id: targetShop.id },
        data: { managerId: user.id }
    });

    return NextResponse.json({ 
        success: true, 
        message: "SUCESSO! Barbearia Automática removida e Polaco vinculada a George." 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
