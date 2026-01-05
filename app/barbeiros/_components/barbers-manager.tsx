
"use client";

import { useState } from "react";
import { Barber } from "@prisma/client";
import { BarberAnalytics } from "../_actions/get-analytics";
import { BarbersList } from "./barbers-list";
import { BarberAnalyticsList } from "./barber-analytics";
import { Users, BarChart3 } from "lucide-react";

interface BarbersManagerProps {
    initialBarbers: Barber[];
    initialAnalytics: BarberAnalytics[];
    barbershopId: string;
}

export function BarbersManager({ initialBarbers, initialAnalytics, barbershopId }: BarbersManagerProps) {
    const [view, setView] = useState<'list' | 'analytics'>('list');

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Tabs Control - Integrated into Header area or Top of content */}
            <div className="flex items-center gap-2 mb-6 bg-muted/30 p-1.5 rounded-xl w-fit self-center md:self-start mx-auto md:mx-0">
                <button
                    onClick={() => setView('list')}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                        ${view === 'list' ? 'bg-background shadow-sm text-brand-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                    `}
                >
                    <Users size={16} />
                    Equipe
                </button>
                <button
                    onClick={() => setView('analytics')}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                        ${view === 'analytics' ? 'bg-background shadow-sm text-brand-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                    `}
                >
                    <BarChart3 size={16} />
                    Desempenho
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
                {view === 'list' ? (
                    <BarbersList initialBarbers={initialBarbers} barbershopId={barbershopId} />
                ) : (
                    <BarberAnalyticsList data={initialAnalytics} />
                )}
            </div>
        </div>
    );
}
