
import { NextResponse } from "next/server";
import { db } from "@/app/_lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "georgeluccas300@gmail.com";
    const newPasswordPlain = "436752";
    
    // 1. Check User in Main DB
    const user = await db.user.findUnique({ where: { email } });
    
    if (user) {
        const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);
        await db.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        return NextResponse.json({ success: true, message: "Senha atualizada no banco PRINCIPAL!" });
    }

    // 2. If not found, try Auth DB logic (simulated by checking if we have a separate client)
    // Assuming handling just main DB for now based on auth.ts
    
    return NextResponse.json({ success: false, message: "Usuário não encontrado em nenhum banco." });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
