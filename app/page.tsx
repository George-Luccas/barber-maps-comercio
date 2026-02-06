
import { auth } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { getStockItems } from "./barbearia/_actions/stock"; 
import { getDailySummary } from "./barbearia/_actions/finance";
import { getBookings } from "@/app/barbearia/_actions/get-bookings";
import { getWeeklyRevenue } from "./barbearia/_actions/analytics";
import DashboardClient from "./_components/dashboard-client";
import { redirect } from "next/navigation";

import ForceLogout from "@/app/components/ForceLogout";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // 1. Verify if user really exists in DB (Security check for deleted users with active session)
  let dbUser = null;
  try {
    dbUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true, // Needed for BARBER_PROMO redirect
            Barbershop: true // Select the relation
        }
    });
  } catch (error) {
    console.error("Critical Error fetching user in dashboard:", error);
    // If we can't fetch the user, we can't trust the session. Safest is to force logout.
    return <ForceLogout />;
  }

  if (!dbUser) {
    // User deleted but session cookie persists -> Render Client Component to Clear Cookie
    return <ForceLogout />;
  }

  const barbershopId = dbUser.Barbershop?.id;
  const userFirstName = dbUser.name.split(' ')[0];

  if (!barbershopId) {
    // Authenticated user but NO barbershop -> Redirect to Onboarding
    redirect("/onboarding");
  }

  if (dbUser.Barbershop?.isSuspended) {
      redirect("/suspended");
  }

  // BARBER_PROMO users go to their profile, not the owner dashboard
  if (dbUser.role === "BARBER_PROMO") {
    redirect("/perfil-barbeiro");
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
