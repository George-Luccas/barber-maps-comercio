"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Barber } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { saveBarber } from "../_actions/barber-actions";
import { Loader2, Upload, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB (Server Action Limit)
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  phone: z.string().optional(),
  imageUrl: z.string().optional(),
});

interface BarberFormProps {
  barber?: Barber | null;
  barbershopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BarberForm({ barber, barbershopId, open, onOpenChange }: BarberFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: barber?.name || "",
      email: barber?.email || "",
      phone: barber?.phone || "",
      imageUrl: barber?.imageUrl || "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) processFile(file);
        }
    }
  };

  const processFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
        toast.error("Arquivo muito grande (Max 5MB)");
        return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Formato inválido. Use JPG, PNG ou WebP");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        form.setValue("imageUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await saveBarber({
        id: barber?.id,
        barbershopId,
        ...values,
      });

      if (result.success) {
        toast.success(barber ? "Barbeiro atualizado" : "Barbeiro criado");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Erro ao salvar");
      }
    } catch (error) {
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{barber ? "Editar Barbeiro" : "Novo Barbeiro"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input 
              {...form.register("name")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-4">
             <label className="text-sm font-medium text-foreground">Foto do Perfil</label>
             
             {/* Upload Area */}
             <div 
                className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer relative overflow-hidden group"
                onPaste={handlePaste}
             >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleImageUpload}
                />
                
                {form.watch("imageUrl") ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-brand-primary/20 group-hover:scale-105 transition-transform">
                        <img 
                            src={form.watch("imageUrl") || ""} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={24} />
                        </div>
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                        <User size={32} />
                    </div>
                )}

                <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Clique para enviar ou Cole (Ctrl+V)</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou WebP (Max 1MB)</p>
                </div>
             </div>

             {/* Explicit URL Input */}
             <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Ou cole a URL da imagem:</label>
                <input 
                    {...form.register("imageUrl")}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email (Opcional)</label>
              <input 
                {...form.register("email")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Telefone</label>
              <input 
                {...form.register("phone")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
