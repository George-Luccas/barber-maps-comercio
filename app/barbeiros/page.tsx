import { auth } from "@/app/_lib/auth";
import { getBarbers } from "./_actions/barber-actions";
import { getBarberAnalytics } from "./_actions/get-analytics";
import { Sidebar } from "@/app/components/Sidebar";
import Link from 'next/link';
import { redirect } from "next/navigation";
import { Plus, User, Trash2, Edit2, Shield, Mail, Phone, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { BarbersManager } from "./_components/barbers-manager";

export const dynamic = 'force-dynamic';

export default async function BarbersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // TODO: Em um cenário real, você buscaria a barbearia do usuário logado
  // Como simplificação, estamos assumindo que o user tem uma barbearia atrelada ou pegando por contexto
  // Aqui vamos simular pegando a barbearia pelo ID fixo ou busca, 
  // mas idealmente deveria vir de db.barbershop.findFirst({ where: { managerId: session.user.id } })
  // Vou usar um server component filho para buscar os dados corretamente no contexto real
  
  // Para este exemplo funcionar sem o contexto global de barbearia no auth, 
  // precisamos buscar a barbearia do usuário:
  const { db } = await import("@/app/_lib/prisma"); // Import dinâmico para evitar erro de build se não usado
  const barbershop = await db.barbershop.findUnique({
    where: { managerId: session.user.id }
  });

  if (!barbershop) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <div className="m-auto text-center p-6">
          <h1 className="text-2xl font-bold mb-2">Barbearia não encontrada</h1>
          <p className="text-muted-foreground">Você precisa ter uma barbearia cadastrada para gerenciar a equipe.</p>
        </div>
      </div>
    );
  }

  const [barbers, analytics] = await Promise.all([
      getBarbers(barbershop.id),
      getBarberAnalytics(barbershop.id)
  ]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:flex flex-col w-64 border-r border-border bg-card">
         {/* Reusing existing Sidebar component logic in layout, so here we might just need to ensure layout wraps it or render it manually if not in layout
             Assumindo que Sidebar está no layout root, aqui renderizamos apenas o conteúdo.
             Mas se layout não tiver sidebar, precisamos por. 
             Pelo file layout.tsx, sidebar já está lá. */}
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 shrink-0 z-20">
          <div className="flex items-center gap-4">
             <Link href="/" className="mr-2 p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                <ArrowLeft size={20} />
             </Link>
            <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary">
               <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-foreground">
                Meus <span className="text-brand-primary">Barbeiros</span>
              </h1>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Gestão da Equipe e Desempenho
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6 md:p-10">
            <BarbersManager 
                initialBarbers={barbers} 
                initialAnalytics={analytics} 
                barbershopId={barbershop.id} 
            />
        </div>
      </main>
    </div>
  );
}
