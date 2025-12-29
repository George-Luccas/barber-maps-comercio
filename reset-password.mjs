import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Primeiro, vamos listar quem está no banco para você não errar o e-mail
  const usuarios = await prisma.user.findMany();
  
  if (usuarios.length === 0) {
    console.log("❌ Nenhum usuário encontrado no banco de dados.");
    return;
  }

  console.log("👥 Usuários encontrados no banco:");
  usuarios.forEach(u => console.log(`- ${u.email}`));

  // 2. Tenta resetar o primeiro usuário da lista (geralmente é o seu)
  const emailAlvo = usuarios[0].email;
  const novaSenha = "123";
  const hashedPassword = await bcrypt.hash(novaSenha, 10);

  const atualizado = await prisma.user.update({
    where: { email: emailAlvo },
    data: { password: hashedPassword },
  });

  console.log(`\n✅ SUCESSO! Senha de [${atualizado.email}] alterada para: ${novaSenha}`);
}

main()
  .catch((e) => console.error("❌ Erro:", e))
  .finally(async () => await prisma.$disconnect());