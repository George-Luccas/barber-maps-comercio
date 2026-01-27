"use client";

import { useEffect, useState } from "react";
import { getAdminDashboardData, toggleBarbershopSuspension } from "./_actions/admin-actions";
import Link from "next/link";
import { ChevronLeft, Loader2, ShieldAlert, Store, User, Users, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getClients } from "../clientes/_actions/client-actions";

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const res = await getAdminDashboardData();
        if (res.success) {
            setUsers(res.users || []);
        } else {
            setError(res.error || "Erro desconhecido");
        }
        setLoading(false);
    }

    async function handleToggleSuspension(shopId: string, currentName: string) {
        if (!confirm(`Tem certeza que deseja alterar o status da barbearia "${currentName}"?`)) return;

        const res = await toggleBarbershopSuspension(shopId);
        if (res.success) {
            // Optimistic update logic could happen here, but reloading data is safer for sync
            loadData();
        } else {
            alert("Erro: " + res.error);
        }
    }

    const handleExportClients = async () => {
        const loadingToast = toast.loading("Gerando PDF...");
        const res = await getClients();
        toast.dismiss(loadingToast);

        if (res.success && res.clients) {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(234, 179, 8); 
            doc.text("BARBER MAPS - LISTA DE CLIENTES (ADMIN)", 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 28);
            
            const tableData = res.clients.map(c => [
                c.name,
                c.phone,
                c.instagram || "-",
                c.tier,
                c.totalCuts
            ]);

            autoTable(doc, {
                startY: 35,
                head: [['Nome', 'Telefone', 'Instagram', 'Nível', 'Cortes']],
                body: tableData as any,
                headStyles: { fillColor: [234, 179, 8], textColor: [0, 0, 0], fontStyle: 'bold' },
                styles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            doc.save(`clientes_admin_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("PDF Gerado com sucesso!");
        } else {
            toast.error("Erro ao buscar clientes: " + (res.error || "Erro desconhecido"));
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 text-red-500">
            <ShieldAlert size={48} />
            <h1 className="text-2xl font-bold">Acesso Negado ou Erro</h1>
            <p>{error}</p>
            <Link href="/" className="underline text-foreground">Voltar para Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Painel <span className="text-brand-primary">ADMIN</span></h1>
                        <p className="text-muted-foreground uppercase font-bold tracking-widest text-sm">Gestão Centralizada de Usuários</p>
                    </div>
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-primary transition-colors">
                        <ChevronLeft size={16} /> Voltar
                    </Link>
                </header>

                <div className="flex justify-end">
                     <button 
                        onClick={handleExportClients}
                        className="flex items-center gap-2 bg-brand-primary text-black px-6 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                     >
                        <Download size={18} />
                        Exportar Clientes (PDF)
                     </button>
                </div>

                <div className="grid gap-6">
                    {users.map(user => {
                        const shop = user.Barbershop;
                        const isSuspended = shop?.isSuspended;

                        return (
                            <div key={user.id} className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm">
                                <div className="flex gap-4 items-center">
                                    <div className="p-4 bg-muted rounded-full">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{user.name}</h3>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-widest ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {user.role}
                                            </span>
                                            {shop && (
                                                <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-widest flex items-center gap-1 ${isSuspended ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                    <Store size={10} /> {isSuspended ? 'SUSPENSA' : 'ATIVA'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {shop ? (
                                    <div className="flex flex-col md:items-end gap-2 w-full md:w-auto bg-muted/30 p-4 rounded-xl">
                                        <p className="font-bold text-sm uppercase">{shop.name}</p>
                                        <p className="text-xs text-muted-foreground mb-2">ID: {shop.id}</p>
                                        <button 
                                            onClick={() => handleToggleSuspension(shop.id, shop.name)}
                                            className={`px-4 py-2 rounded-lg font-black uppercase text-xs tracking-widest transition-all w-full md:w-auto shadow-sm ${
                                                isSuspended 
                                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                                : 'bg-red-500 text-white hover:bg-red-600'
                                            }`}
                                        >
                                            {isSuspended ? 'ATIVAR SERVIÇOS' : 'SUSPENDER SERVIÇOS'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-muted/50 rounded-xl text-center w-full md:w-auto">
                                        <span className="text-xs uppercase font-black text-muted-foreground tracking-widest">Sem Barbearia</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* RELATÓRIO DE DESCONTOS */}
                <DiscountReportSection />
            </div>
        </div>
    );
}

function DiscountReportSection() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import("./_actions/admin-actions").then(mod => {
            mod.getDiscountStats().then(res => {
                if (res.success) setStats(res.stats || []);
                setLoading(false);
            });
        });
    }, []);

    if (loading) return <div className="p-4 text-center text-muted-foreground">Carregando estatísticas...</div>;

    return (
        <div className="space-y-4">
            <header className="flex items-center gap-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                     <Users size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Relatório de <span className="text-yellow-500">Descontos</span></h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Utilização por Barbearia</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.length > 0 ? stats.map((stat) => (
                    <div key={stat.id} className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="flex flex-col">
                            <span className="font-bold text-sm uppercase">{stat.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Descontos Aplicados</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-black text-xl">
                                 {stat.discountCount}
                             </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full p-8 text-center border-2 border-dashed border-border rounded-2xl">
                        <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Nenhum desconto registrado ainda</p>
                    </div>
                )}
            </div>
        </div>
    );
}
