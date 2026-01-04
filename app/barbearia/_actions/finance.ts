"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionType, PaymentMethod } from "@prisma/client";

export async function addTransaction(data: {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  paymentMethod: PaymentMethod;
  barbershopId: string;
  date?: Date;
  stockItemId?: string; // Novo parâmetro opcional
  barberId?: string;
}) {
  try {
    // Se houver item de estoque vinculado, baixamos 1 unidade
    if (data.stockItemId) {
      await db.stockItem.update({
        where: { id: data.stockItemId },
        data: { quantity: { decrement: 1 } }
      });
    }

    const transaction = await db.financialTransaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category,
        paymentMethod: data.paymentMethod,
        barbershopId: data.barbershopId,
        date: data.date || new Date(),
        barberId: data.barberId
      }
    });

    revalidatePath("/financeiro");
    revalidatePath("/estoque"); // Atualiza também a página de estoque
    return { success: true, transaction };
  } catch (error) {
    console.error("Erro ao adicionar transação:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: errorMessage };
  }
}

export async function getDailySummary(barbershopId: string, date: Date = new Date()) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await db.financialTransaction.findMany({
      where: {
        barbershopId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { date: 'desc' }
    });

    const income = transactions
      .filter(t => t.type === "INCOME")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expense = transactions
      .filter(t => t.type === "EXPENSE")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const balance = income - expense;

    // Buscar meta diária do barbeiro
    const barbershop = await db.barbershop.findUnique({
      where: { id: barbershopId },
      select: { dailyGoal: true }
    });

    // Serializar transações para evitar erro de Decimal
    const serializedTransactions = transactions.map(t => ({
      ...t,
      amount: Number(t.amount)
    }));

    return { 
      success: true, 
      summary: {
        income,
        expense,
        balance,
        transactions: serializedTransactions,
        dailyGoal: Number(barbershop?.dailyGoal || 500)
      }
    };
  } catch (error) {
    console.error("Erro ao buscar resumo diário:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: errorMessage }; 
  }
}

export async function updateDailyGoal(barbershopId: string, newGoal: number) {
  try {
    const updated = await db.barbershop.update({
      where: { id: barbershopId },
      data: { dailyGoal: newGoal }
    });
    return { success: true, goal: Number(updated.dailyGoal) };
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: errorMessage };
  }
}

export async function getFinancialReport(barbershopId: string, startDate: Date, endDate: Date) {
  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const transactions = await db.financialTransaction.findMany({
      where: {
        barbershopId,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: { date: 'desc' }
    });

     const income = transactions
      .filter(t => t.type === "INCOME")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expense = transactions
      .filter(t => t.type === "EXPENSE")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Serializar transações
    const serializedTransactions = transactions.map(t => ({
      ...t,
      amount: Number(t.amount)
    }));

    return { 
      success: true, 
      report: {
        income,
        expense,
        balance: income - expense,
        transactions: serializedTransactions
      }
    };
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: errorMessage };
  }
}
