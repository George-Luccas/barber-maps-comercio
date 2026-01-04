"use client";

import { useState } from "react";
import { Barber } from "@prisma/client";
import { Plus, User, Trash2, Edit2, Mail, Phone, MoreVertical } from "lucide-react";
import Image from "next/image";
import { BarberForm } from "./barber-form";
import { deleteBarber } from "../_actions/barber-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

interface BarbersListProps {
  initialBarbers: Barber[];
  barbershopId: string;
}

export function BarbersList({ initialBarbers, barbershopId }: BarbersListProps) {
  const [barbers] = useState<Barber[]>(initialBarbers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const router = useRouter();

  const handleAddKey = () => {
    setSelectedBarber(null);
    setIsFormOpen(true);
  };

  const handleEdit = (barber: Barber) => {
    setSelectedBarber(barber);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este barbeiro?")) {
      const result = await deleteBarber(id);
      if (result.success) {
        toast.success("Barbeiro removido");
        router.refresh();
      } else {
        toast.error("Erro ao remover");
      }
    }
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <button 
          onClick={handleAddKey}
          className="bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-primary/20 hover:scale-105"
        >
          <Plus size={18} />
          Novo Barbeiro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {initialBarbers.map((barber) => (
          <div key={barber.id} className="group bg-card border border-border/50 hover:border-brand-primary/50 transition-all rounded-[2rem] p-6 flex flex-col items-center relative overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-4 right-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 rounded-full hover:bg-muted/50 transition-colors outline-none text-muted-foreground hover:text-foreground">
                  <MoreVertical size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 bg-card border-border">
                  <DropdownMenuItem onClick={() => handleEdit(barber)} className="cursor-pointer">
                    <Edit2 size={14} className="mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(barber.id)} className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-500/10">
                    <Trash2 size={14} className="mr-2" /> Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="w-24 h-24 rounded-full bg-muted border-4 border-card shadow-xl mb-4 relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
              {barber.imageUrl ? (
                <img src={barber.imageUrl} alt={barber.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary">
                  <User size={40} />
                </div>
              )}
            </div>

            <h3 className="text-lg font-black uppercase text-foreground mb-1 text-center truncate w-full px-2">{barber.name}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Barbeiro Profissional</span>

            <div className="w-full space-y-2 mt-auto">
              {barber.email && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg truncate">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{barber.email}</span>
                </div>
              )}
              {barber.phone && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg truncate">
                  <Phone size={14} className="shrink-0" />
                  <span className="truncate">{barber.phone}</span>
                </div>
              )}
            </div>
            
            {/* Decorative Glow */}
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-primary/10 transition-all" />
          </div>
        ))}

        {initialBarbers.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
            <User size={48} className="mb-4" />
            <p className="font-medium">Nenhum barbeiro cadastrado</p>
          </div>
        )}
      </div>

      <BarberForm 
        barber={selectedBarber}
        barbershopId={barbershopId}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </>
  );
}
