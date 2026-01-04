
import { auth } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { getStockItems } from "./barbearia/_actions/stock"; 
import { getDailySummary } from "./barbearia/_actions/finance";
import { getBookings } from "@/app/barbearia/_actions/get-bookings";
import { getWeeklyRevenue } from "./barbearia/_actions/analytics";
import DashboardClient from "./_components/dashboard-client";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const barbershopId = (session.user as any).barbershopId;
  const userFirstName = session.user.name ? session.user.name.split(' ')[0] : "Mestre";

  if (!barbershopId) {
    // If authenticated but no barbershop connected, maybe redirect to onboarding or show empty state?
    // For now, let's assuming redirection or handling is essentially same as empty.
    // But getting here means something is wrong with session or onboarding.
    // The original code handled it by doing nothing.
    return (
        <div className="min-h-screen flex items-center justify-center text-foreground">
            <p>Erro: Barbearia não encontrada para este usuário.</p>
        </div>
    );
  }

  // Pre-calculate today's date for initial view
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  // Batch fetch data on server
  // We use Promise.allSettled or Promise.all. Promise.all is faster but fails if one fails.
  // The original code used Promise.all for some, separate for revenue.
  // Let's use Promise.all for max speed, but wrapped in try/catch individual functions if needed.
  // The actions usually return objects like { success: true, ... } or plain data.
  // We should make sure we handle failures gracefully if possible, or just let them return defaults.

  const [stockRes, financeRes, bookingsRes, weeklyRevenueRes] = await Promise.all([
    getStockItems(barbershopId),
    getDailySummary(barbershopId, new Date()),
    getBookings(barbershopId, today),
    getWeeklyRevenue(barbershopId)
  ]);

  const initialStockItems = stockRes.success ? stockRes.items : [];
  
  const initialFinanceData = (financeRes.success && financeRes.summary) ? {
    income: Number(financeRes.summary.income),
    dailyGoal: Number(financeRes.summary.dailyGoal || 500)
  } : { income: 0, dailyGoal: 500 };

  const initialBookings = bookingsRes || [];
  const initialWeeklyRevenue = weeklyRevenueRes || [];

  // Fetch shop status
  const shop = await db.barbershop.findUnique({
      where: { id: barbershopId },
      select: { isOpen: true }
  });
  const initialShopStatus = shop?.isOpen ?? true;

  return (
    <DashboardClient 
        barbershopId={barbershopId}
        userFirstName={userFirstName}
        initialStockItems={initialStockItems}
        initialFinanceData={initialFinanceData}
        initialBookings={initialBookings}
        initialWeeklyRevenue={initialWeeklyRevenue}
        initialShopStatus={initialShopStatus}
    />
  );
}
