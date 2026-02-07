/**
 * Script para verificar o estado do usuário e listar todos os BARBER_PROMO
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBarberPromo() {
  console.log(`\n📋 Verificando usuários BARBER_PROMO...\n`);

  // 1. Buscar todos os BARBER_PROMO
  const barbers = await prisma.user.findMany({
    where: { role: 'BARBER_PROMO' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      image: true,
      specialties: true,
      isAutonomous: true,
      workplaceName: true,
      yearsOfExperience: true,
    }
  });

  console.log(`Total de BARBER_PROMO no banco: ${barbers.length}\n`);
  
  if (barbers.length === 0) {
    console.log(`⚠️  NENHUM usuário com role BARBER_PROMO encontrado!`);
  } else {
    barbers.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name} (${b.email})`);
      console.log(`   ID: ${b.id}`);
      console.log(`   Role: ${b.role}`);
      console.log(`   Bio: ${b.bio || '-'}`);
      console.log(`   Autônomo: ${b.isAutonomous}`);
      console.log(`   Barbearia trabalha: ${b.workplaceName || '-'}`);
      console.log(``);
    });
  }

  // 2. Buscar especificamente o barberinhoo
  console.log(`\n🔍 Buscando barberinhoo@adm.com especificamente...`);
  const specific = await prisma.user.findUnique({
    where: { email: 'barberinhoo@adm.com' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      image: true,
      Barbershop: true,
    }
  });

  if (specific) {
    console.log(`\n✅ Encontrado:`);
    console.log(`   ID: ${specific.id}`);
    console.log(`   Nome: ${specific.name}`);
    console.log(`   Role: ${specific.role}`);
    console.log(`   Tem Barbearia: ${specific.Barbershop ? 'SIM' : 'NÃO'}`);
    
    if (specific.role !== 'BARBER_PROMO') {
      console.log(`\n⚠️  PROBLEMA: Role é ${specific.role}, deveria ser BARBER_PROMO`);
    }
  } else {
    console.log(`\n❌ Usuário barberinhoo@adm.com NÃO ENCONTRADO no banco!`);
  }
}

checkBarberPromo()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
