import { ShieldAlert } from "lucide-react";

export default function SuspendedPage() {
    return (
        <div className="h-screen w-full bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="p-6 bg-red-500/10 rounded-full animate-pulse">
                <ShieldAlert size={64} className="text-red-500" />
            </div>
            
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                Serviços Suspensos
            </h1>
            
            <p className="max-w-md text-muted-foreground font-medium">
                O acesso à plataforma para esta barbearia foi temporariamente suspenso pela administração.
            </p>

            <div className="bg-card border border-border p-6 rounded-xl w-full max-w-sm">
                <h3 className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-2">O que fazer?</h3>
                <p className="text-sm">
                    Entre em contato com o suporte ou administrador do sistema para regularizar sua situação.
                </p>
            </div>
        </div>
    );
}
