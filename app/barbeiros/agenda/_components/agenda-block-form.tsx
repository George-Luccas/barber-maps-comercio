"use client";

import { useState } from "react";
import { blockTimeSlot } from "../../_actions/agenda-actions";
import { toast } from "sonner";
import { Loader2, Lock, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface AgendaBlockFormProps {
    uniqueShopId: string;
}

export function AgendaBlockForm({ uniqueShopId }: AgendaBlockFormProps) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!date || !time) {
            toast.warning("Selecione data e hora.");
            return;
        }

        setLoading(true);

        const res = await blockTimeSlot({
            date: new Date(date), // Local date string yyyy-mm-dd works fine with new Date() constructor in browser
            time,
            scarcityReason: reason,
            uniqueShopId
        });

        if (res.success) {
            toast.success("Horário bloqueado com sucesso!");
            setDate("");
            setTime("");
            setReason("");
            router.refresh();
        } else {
            toast.error("Erro ao bloquear: " + res.error);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto bg-card border border-border p-6 rounded-2xl shadow-sm">
            <header className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                    <Lock size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Bloquear Agenda</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Impedir novos agendamentos</p>
                </div>
            </header>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} /> Data
                    </label>
                    <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 rounded-xl border border-border bg-background font-medium"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                       <Clock size={12} /> Hora de Início
                    </label>
                    <input 
                        type="time" 
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-3 rounded-xl border border-border bg-background font-medium"
                    />
                    <p className="text-[10px] text-muted-foreground">
                        * O bloqueio ocupará 45 minutos por padrão.
                    </p>
                </div>

                <div className="space-y-1">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                       <AlertTriangle size={12} /> Motivo (Opcional)
                    </label>
                    <input 
                        type="text" 
                        placeholder="Ex: Almoço, Médico, Folga..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-3 rounded-xl border border-border bg-background font-medium"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Confirmar Bloqueio"}
            </button>
        </form>
    );
}
