
import { db } from "@/app/_lib/prisma";
import { sendEmail } from "@/app/_lib/mail";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Segurança: sempre retornar sucesso mesmo se o usuário não existir para evitar enumeração de usuários
    if (!user) {
      return NextResponse.json({ ok: true }); 
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    // Remove tokens antigos desse usuário se houver (opcional, mas bom pra limpeza)
    await db.passwordResetToken.deleteMany({ where: { email } });

    await db.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.URL || "http://localhost:3000";
    const link = `${baseUrl}/reset-password?token=${token}`;

    await sendEmail(email, link);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Erro no forgot-password:", error);
    return NextResponse.json({ error: error.message || "Erro interno ao enviar email" }, { status: 500 });
  }
}
