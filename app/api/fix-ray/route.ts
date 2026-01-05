
import { NextResponse } from "next/server";
import { db } from "@/app/_lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const email = "rayfelipeoliveira.87@gmail.com";
    
    // 1. DELETE User (in main DB)
    // Isso vai cascatear para barbearia (se existir) e outros dados devido ao onDelete: Cascade ou comportamento prisma
    
    const user = await db.user.delete({ 
        where: { email }
    });
    
    return NextResponse.json({ success: true, message: `Usuário Ray (${email}) EXCLUÍDO com sucesso! Pode criar de novo.` });

  } catch (error: any) {
    if (error.code === 'P2025') {
         return NextResponse.json({ success: true, message: "Usuário Ray já não existia." });
    }
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
