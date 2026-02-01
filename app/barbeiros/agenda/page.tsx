
import { auth } from "@/app/_lib/auth";
import Link from 'next/link';
import { redirect } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { AgendaBlockForm } from "./_components/agenda-block-form";

export const dynamic = 'force-dynamic';

export default async function AgendaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { db } = await import("@/app/_lib/prisma");

  // Fetch Barbershop managed by this user
  const barbershop = await db.barbershop.findUnique({
    where: { managerId: session.user.id }
  });

  if (!barbershop) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-2">Barbearia não encontrada</h1>
          <p className="text-muted-foreground">Você precisa ser gerente de uma barbearia para acessar essa agenda.</p>
          <Link href="/" className="mt-4 inline-block text-blue-500 underline">Voltar para Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar placeholder - layout usually handles this but we need structure consistency with barbeiros/page */}
        <div className="hidden md:flex flex-col w-64 border-r border-border bg-card"></div>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 shrink-0 z-20">
          <div className="flex items-center gap-4">
             <Link href="/barbeiros" className="mr-2 p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                <ArrowLeft size={20} />
             </Link>
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
               <Calendar size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-foreground">
                Gestão de <span className="text-orange-500">Agenda</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Bloqueio de Horários e Disponibilidade
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 md:p-10 flex items-center justify-center">
             <div className="w-full max-w-lg">
                <AgendaBlockForm uniqueShopId={barbershop.id} />
             </div>
        </div>
      </main>
    </div>
  );
}
