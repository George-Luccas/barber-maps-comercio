
import { db } from "@/app/_lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
        return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const record = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { email: record.email },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no reset-password:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
