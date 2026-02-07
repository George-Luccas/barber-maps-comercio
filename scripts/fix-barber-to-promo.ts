/**
 * Script para corrigir usuário que foi criado como BARBER mas deveria ser BARBER_PROMO
 * 
 * Uso: npx tsx scripts/fix-barber-to-promo.ts <email-do-usuario>
 * Exemplo: npx tsx scripts/fix-barber-to-promo.ts george@email.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBarberToPromo(email: string) {
  console.log(`\n🔧 Corrigindo usuário: ${email}\n`);

  // 1. Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { Barbershop: true }
  });

  if (!user) {
    console.error(`❌ Usuário não encontrado: ${email}`);
    return;
  }

  console.log(`📋 Dados atuais:`);
  console.log(`   - ID: ${user.id}`);
  console.log(`   - Nome: ${user.name}`);
  console.log(`   - Role: ${user.role}`);
  console.log(`   - Tem barbearia: ${user.Barbershop ? 'SIM (' + user.Barbershop.name + ')' : 'NÃO'}`);

  if (user.role === 'BARBER_PROMO' && !user.Barbershop) {
    console.log(`\n✅ Usuário já está correto como BARBER_PROMO sem barbearia.`);
    return;
  }

  // 2. Se tem barbearia, deletar
  if (user.Barbershop) {
    console.log(`\n🗑️  Deletando barbearia: ${user.Barbershop.name} (${user.Barbershop.id})`);
    
    // Verificar se tem dados vinculados
    const bookingsCount = await prisma.booking.count({ where: { barbershopId: user.Barbershop.id }});
    const barbersCount = await prisma.barber.count({ where: { barbershopId: user.Barbershop.id }});
    const servicesCount = await prisma.barbershopService.count({ where: { barbershopId: user.Barbershop.id }});
    
    if (bookingsCount > 0 || barbersCount > 0 || servicesCount > 0) {
      console.log(`\n⚠️  ATENÇÃO: Barbearia tem dados vinculados:`);
      console.log(`   - Agendamentos: ${bookingsCount}`);
      console.log(`   - Barbeiros: ${barbersCount}`);
      console.log(`   - Serviços: ${servicesCount}`);
      console.log(`\n   Deletando dados vinculados primeiro...`);
      
      // Deletar em ordem de dependência
      await prisma.booking.deleteMany({ where: { barbershopId: user.Barbershop.id }});
      await prisma.barber.deleteMany({ where: { barbershopId: user.Barbershop.id }});
      await prisma.barbershopService.deleteMany({ where: { barbershopId: user.Barbershop.id }});
      await prisma.review.deleteMany({ where: { barbershopId: user.Barbershop.id }});
      await prisma.financialTransaction.deleteMany({ where: { barbershopId: user.Barbershop.id }});
      await prisma.stockItem.deleteMany({ where: { barbershopId: user.Barbershop.id }});
      await prisma.barbershopProduct.deleteMany({ where: { barbershopId: user.Barbershop.id }});
      await prisma.loyaltyCard.deleteMany({ where: { barbershopId: user.Barbershop.id }});
      await prisma.style.deleteMany({ where: { barbershopId: user.Barbershop.id }});
    }
    
    await prisma.barbershop.delete({ where: { id: user.Barbershop.id }});
    console.log(`   ✅ Barbearia deletada!`);
  }

  // 3. Atualizar role para BARBER_PROMO
  console.log(`\n🔄 Atualizando role para BARBER_PROMO...`);
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      role: 'BARBER_PROMO',
      isAutonomous: true, // Definir como autônomo por padrão
      workplaceName: null,
    }
  });

  console.log(`\n✅ Correção concluída!`);
  console.log(`   - ${user.name} agora é BARBER_PROMO (Barbeiro Divulgação)`);
  console.log(`   - Não tem mais barbearia vinculada`);
  console.log(`   - No próximo login, verá o menu de barbeiro\n`);
}

// Executar
const email = process.argv[2];

if (!email) {
  console.log(`
Uso: npx tsx scripts/fix-barber-to-promo.ts <email>

Exemplo:
  npx tsx scripts/fix-barber-to-promo.ts george@email.com
  `);
  process.exit(1);
}

fixBarberToPromo(email)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
