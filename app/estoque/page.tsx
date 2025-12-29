"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft, Package, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createStockItem, getStockItems, updateStockQuantity } from "@/app/barbearia/_actions/stock";

export default function EstoquePage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Feedback visual para o usuário
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estados do Formulário
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minQuantity, setMinQuantity] = useState("");

  const barbershopId = (session?.user as any)?.barbershopId;

  const loadData = async () => {
    if (!barbershopId) return;
    const res = await getStockItems(barbershopId);
    if (res.success) setItems(res.items);
  };

  useEffect(() => {
    setMounted(true);
    if (barbershopId) loadData();
  }, [barbershopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Validação de segurança
    if (!barbershopId) {
      setStatusMsg({ type: 'error', text: "Erro: ID da barbearia não encontrado na sessão." });
      return;
    }
    if (!name || !quantity) {
      setStatusMsg({ type: 'error', text: "Preencha o nome e a quantidade inicial." });
      return;
    }

    setLoading(true);
    try {
      const res = await createStockItem({
        name,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity) || 0,
        unit: "un",
        barbershopId
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: "Produto adicionado com sucesso!" });
        setName("");
        setQuantity("");
        setMinQuantity("");
        await loadData();
      } else {
        const errorText = (res as any).error ? `Erro: ${(res as any).error}` : "Erro ao salvar no banco de dados.";
        setStatusMsg({ type: 'error', text: errorText });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Erro de conexão com o servidor." });
      console.error(error);
    } finally {
      setLoading(false);
      // Remove a mensagem após 3 segundos
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleUpdate = async (id: string, amount: number) => {
    const res = await updateStockQuantity(id, amount);
    if (res.success) loadData();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white p-8 transition-colors duration-300">
      {/* Mensagem Flutuante (Toast) */}
      {statusMsg && (
        <div className={`fixed top-10 right-10 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border animate-in slide-in-from-right duration-300 ${
          statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold uppercase text-[10px] tracking-widest">{statusMsg.text}</span>
        </div>
      )}

      {/* Header com Voltar */}
      <div className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
          <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-transparent shadow-sm dark:shadow-none">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold uppercase text-xs tracking-widest">Voltar ao Painel</span>
        </Link>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
          Gestão de <span className="text-yellow-500">Estoque</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Formulário de Cadastro */}
        <div className="md:col-span-5">
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] sticky top-8 shadow-xl dark:shadow-2xl">
            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2 text-zinc-900 dark:text-white">
              <Plus size={20} className="text-yellow-500" /> Novo Insumo
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Produto</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Gola Higiênica"
                  className="w-full bg-gray-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Qtd Inicial</label>
                  <input 
                    type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:border-yellow-500 outline-none transition-all text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Qtd Mínima</label>
                  <input 
                    type="number" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)}
                    placeholder="5"
                    className="w-full bg-gray-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:border-yellow-500 outline-none transition-all text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-yellow-400 active:scale-95 transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Adicionar ao Banco"}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2 text-zinc-600 dark:text-zinc-500 ml-4">
            <Package size={20} /> Itens em Estoque
          </h2>
          {items.length === 0 && (
            <div className="p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] text-center">
              <p className="text-zinc-500 dark:text-zinc-600 font-bold uppercase text-xs italic tracking-widest">Nenhum item cadastrado</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-6 bg-white dark:bg-zinc-900/20 border rounded-[2rem] transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm dark:shadow-none ${item.quantity <= item.minQuantity ? 'border-red-500/30 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'border-zinc-200 dark:border-zinc-800'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${item.quantity <= item.minQuantity ? 'bg-red-500/20 text-red-500' : 'bg-gray-100 dark:bg-black/50 text-zinc-600 dark:text-zinc-500'}`}>
                  <Package size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight leading-none mb-1">{item.name}</h4>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic">Abaixo de {item.minQuantity} un alerta</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right leading-none">
                  <p className={`text-3xl font-black italic tracking-tighter ${item.quantity <= item.minQuantity ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>{item.quantity}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(item.id, -1)} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-90 transition-all font-black text-zinc-900 dark:text-white">-</button>
                  <button onClick={() => handleUpdate(item.id, 1)} className="w-10 h-10 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 active:scale-90 transition-all font-black">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}