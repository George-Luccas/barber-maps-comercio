"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@/app/_lib/auth";
import { subDays, addHours, startOfDay } from "date-fns";

export async function seedMockData(barbershopId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized or User ID missing");

  // 1. Garantir que existam Serviços (Services)
  let service = await db.barbershopService.findFirst({ where: { barbershopId } });
  if (!service) {
      service = await db.barbershopService.create({
          data: {
              name: "Corte Degradê",
              description: "Corte moderno com acabamento na navalha",
              priceInCents: 4500, // R$ 45,00
              imageUrl: "",
              barbershopId
          }
      });
  }

  // Criar um segundo serviço para variedade
  const service2 = await db.barbershopService.create({
      data: {
          name: "Barba Terapia",
          description: "Barba completa com toalha quente",
          priceInCents: 3500, // R$ 35,00
          imageUrl: "",
          barbershopId
      }
  });

  // 2. Garantir que exista um User CLIENT
  // Vamos usar o próprio usuário logado se ele tiver perfil, ou criar dummies se necessário. 
  // Para simplificar, vou usar o ID do usuário atual para todos os agendamentos, 
  // mas variar o nome do cliente não é possível fácil sem criar users novos no auth.
  // Vou criar bookings usando o current user mesmo.
  const userId = session.user.id;

  // 3. Gerar Agendamentos Passados (Histórico de 30 dias)
  const bookingsData = [];
  const start = subDays(new Date(), 30);
  
  for (let i = 0; i < 40; i++) {
     // Dia aleatório nos últimos 30 dias
     const daysAgo = Math.floor(Math.random() * 30);
     const date = subDays(new Date(), daysAgo);
     
     // Hora aleatória (09h as 19h)
     const hour = 9 + Math.floor(Math.random() * 10);
     date.setHours(hour, 0, 0, 0);

     // Escolhe serviço
     const s = Math.random() > 0.5 ? service : service2;

     bookingsData.push({
         barbershopId,
         userId,
         serviceId: s.id,
         date: date,
         createdAt: subDays(date, 2), // Criado 2 dias antes
         updatedAt: date
     });
  }

  // Batch insert não suportado diretamente com foreign keys complexas as vezes, mas createMany funciona bem
  await db.booking.createMany({
      data: bookingsData
  });

  // 4. Gerar Transações Financeiras (Venda de Produtos)
  const transactionsData = [];
  const products = ["Pomada Matte", "Gel Fixador", "Shampoo 2em1", "Óleo para Barba"];
  
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = subDays(new Date(), daysAgo);
    const hour = 9 + Math.floor(Math.random() * 10);
    date.setHours(hour, 30, 0, 0);

    const product = products[Math.floor(Math.random() * products.length)];
    const price = 25 + Math.floor(Math.random() * 40); // 25 a 65 reais

    transactionsData.push({
        barbershopId,
        type: "INCOME" as const,
        amount: price,
        description: `Venda: ${product}`,
        category: "Venda de Produtos",
        paymentMethod: "CARD" as const,
        date: date,
        createdAt: date,
        updatedAt: date
    });
  }

  await db.financialTransaction.createMany({
      data: transactionsData
  });

  return { success: true, message: "Dados gerados com sucesso!" };
}
