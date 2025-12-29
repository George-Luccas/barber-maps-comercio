"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Target, Landmark, ArrowUpCircle, ArrowLeft, Calendar, TrendingUp, TrendingDown, DollarSign, Trash2, Eye, EyeOff, Package, Scissors } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { addTransaction, getDailySummary, updateDailyGoal } from "@/app/barbearia/_actions/finance";
import { getStockItems } from "@/app/barbearia/_actions/stock";
import { getBarbershopServices } from "@/app/barbearia/_actions/service"; // Nova Importação
import jsPDF from "jspdf";

export default function FinancialManager() {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Controle de Visualização
  const [showBalance, setShowBalance] = useState(false);

  // Dados do Caixa
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, dailyGoal: 500 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Listas de Seleção
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]); // Nova Lista

  // Formulário
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [paymentMethod, setPaymentMethod] = useState("MONEY");
  const [category, setCategory] = useState("Serviço");
  
  const [selectedStockId, setSelectedStockId] = useState(""); 
  const [selectedServiceId, setSelectedServiceId] = useState(""); // Novo State

  const barbershopId = (session?.user as any)?.barbershopId;

  // Carregar dados
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = async () => {
    if (!barbershopId) return;
    setLoading(true);
    
    // Ajuste de fuso horário simples
    const [year, month, day] = selectedDate.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    const res = await getDailySummary(barbershopId, localDate);
    if (res.success && res.summary) {
      setTransactions(res.summary.transactions);
      setSummary({
        income: res.summary.income,
        expense: res.summary.expense,
        balance: res.summary.balance,
        dailyGoal: res.summary.dailyGoal || 500
      });
    }

    // Carregar itens de estoque se ainda não carregou
    if (stockItems.length === 0) {
        const stockRes = await getStockItems(barbershopId);
        if (stockRes.success) {
            setStockItems(stockRes.items);
        }
    }

    // Carregar serviços se ainda não carregou
    if (services.length === 0) {
        const servRes = await getBarbershopServices(barbershopId);
        if (servRes.success) {
            setServices(servRes.services);
        }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [barbershopId, selectedDate]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const progresso = Math.min((summary.income / summary.dailyGoal) * 100, 100);
  const faltante = Math.max(summary.dailyGoal - summary.income, 0);

  // Handlers para auto-preencher
  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStockId = e.target.value;
    setSelectedStockId(newStockId);
    
    if (newStockId) {
        const item = stockItems.find(i => i.id === newStockId);
        if (item) {
            setDescription(`Venda: ${item.name}`);
            setCategory("Produto");
            setSelectedServiceId(""); 
        }
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newServiceId = e.target.value;
      setSelectedServiceId(newServiceId);

      if (newServiceId) {
        const service = services.find(s => s.id === newServiceId);
        if (service) {
            setDescription(service.name);
            const priceInReais = (service.priceInCents / 100).toFixed(2);
            setAmount(priceInReais);
            setCategory("Serviço");
            setSelectedStockId(""); 
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !barbershopId) return;

    setLoading(true);
    await addTransaction({
      barbershopId,
      description,
      amount: Number(amount),
      type,
      paymentMethod: paymentMethod as any,
      category,
      date: new Date(),
      stockItemId: selectedStockId || undefined // Passa o ID se houver
    });

    // Limpar form
    setDescription("");
    setAmount("");
    setSelectedStockId(""); 
    setSelectedServiceId(""); // Reset
    setLoading(false);
    
    // Recarregar dados
    loadData();
  };

  const alterarMeta = async () => {
    const novaMeta = prompt("Defina sua meta diária:", summary.dailyGoal.toString());
    if (novaMeta && !isNaN(Number(novaMeta))) {
      const valorNumerico = Number(novaMeta);
      
      // Update otimista
      setSummary(prev => ({ ...prev, dailyGoal: valorNumerico }));
      
      if (barbershopId) {
        await updateDailyGoal(barbershopId, valorNumerico);
      }
    }
  };

  const handleFecharCaixa = () => {
    const confirmar = confirm("Deseja encerrar o caixa e gerar o relatório em PDF?");
    if (confirmar) {
      const doc = new jsPDF();
      const [ano, mes, dia] = selectedDate.split('-');
      const dataFormatada = `${dia}/${mes}/${ano}`;

      // Cálculos Analíticos
      const incomeTransactions = transactions.filter(t => t.type === "INCOME");
      const totalServices = incomeTransactions.length;
      const ticketAverage = totalServices > 0 ? (summary.income / totalServices) : 0;
      
      // Agrupamento por Método de Pagamento
      const paymentBreakdown = transactions.reduce((acc: any, t) => {
        if (!acc[t.paymentMethod]) acc[t.paymentMethod] = 0;
        if (t.type === "INCOME") acc[t.paymentMethod] += Number(t.amount);
        return acc;
      }, {});

      doc.setFontSize(22);
      doc.setTextColor(234, 179, 8);
      doc.text("BARBER MAPS - RELATÓRIO DE DESEMPENHO", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 28);
      doc.text(`Referência: ${dataFormatada}`, 20, 33);
      doc.line(20, 38, 190, 38);

      // 1. Resumo Executivo
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("1. Resumo Financeiro", 20, 50);
      
      doc.setFontSize(11);
      doc.text(`Faturamento Bruto: R$ ${summary.income.toFixed(2)}`, 25, 60);
      doc.text(`Despesas Totais: R$ ${summary.expense.toFixed(2)}`, 100, 60);
      
      doc.setFontSize(12);
      if (summary.balance >= 0) doc.setTextColor(0, 128, 0);
      else doc.setTextColor(200, 0, 0);
      doc.text(`Saldo Líquido: R$ ${summary.balance.toFixed(2)}`, 25, 70);

      // 2. Análise de Desempenho
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("2. Indicadores de Performance", 20, 85);
      
      doc.setFontSize(11);
      doc.text(`Meta Estipulada: R$ ${summary.dailyGoal.toFixed(2)}`, 25, 95);
      const porcentagemMeta = ((summary.income / summary.dailyGoal) * 100).toFixed(1);
      doc.text(`Atingimento: ${porcentagemMeta}%`, 100, 95);

      doc.text(`Total de Atendimentos: ${totalServices}`, 25, 105);
      doc.text(`Ticket Médio: R$ ${ticketAverage.toFixed(2)}`, 100, 105);

      // 3. Detalhamento por Pagamento
      doc.setFontSize(14);
      doc.text("3. Conferência de Caixa (Por Pagamento)", 20, 120);
      
      doc.setFontSize(10);
      let yPay = 130;
      Object.entries(paymentBreakdown).forEach(([method, value]) => {
         const methodNames: any = { MONEY: "Dinheiro (Espécie)", PIX: "Pix", CARD: "Cartão de Crédito/Débito", OTHER: "Outros" };
         doc.text(`• ${methodNames[method] || method}:`, 25, yPay);
         doc.text(`R$ ${Number(value).toFixed(2)}`, 100, yPay);
         yPay += 7;
      });

      // 4. Extrato
      doc.setFontSize(14);
      doc.text("4. Extrato Detalhado", 20, yPay + 10);
      let y = yPay + 20;
      
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Hora / Descrição", 20, y);
      doc.text("Valor", 170, y);
      y += 5;

      transactions.forEach((t) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const valor = Number(t.amount).toFixed(2);
        const hora = new Date(t.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        
        if(t.type === 'INCOME') doc.setTextColor(0, 100, 0);
        else doc.setTextColor(200, 0, 0);
        
        doc.text(`${hora} - ${t.description} (${t.category || 'Geral'})`, 20, y);
        doc.text(`${t.type === 'INCOME' ? '+' : '-'} R$ ${valor}`, 170, y);
        y += 7;
      });

      doc.save(`fechamento_${selectedDate}.pdf`);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full font-sans p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-4">
        <Link href="/" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors group">
          <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-transparent shadow-sm dark:shadow-none">
            <ArrowLeft size={20} />
          </div>
          <span className="font-bold uppercase text-xs tracking-widest hidden md:block">Voltar ao Painel</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none">
          Livro <span className="text-yellow-600 dark:text-yellow-500">Caixa</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: Resumo e Formulário */}
        <div className="md:col-span-5 space-y-6">
          
          {/* CARD DE SALDO */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-3xl flex items-center justify-between shadow-sm dark:shadow-none">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400">
                  <DollarSign size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Saldo em Caixa</p>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
                     {showBalance ? `R$ ${summary.balance.toFixed(2)}` : "R$ ••••••"}
                  </h3>
               </div>
             </div>
             <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>
          </div>

          {/* CARD DE META */}
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Falta para a Meta</p>
                <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">R$ {faltante.toFixed(2)}</h2>
              </div>
              <button onClick={alterarMeta} className="p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-yellow-500 transition active:scale-95">
                <Target size={18} />
              </button>
            </div>
            <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden mt-2">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 items-center">
              <p className="text-[9px] text-zinc-600 uppercase font-bold">{progresso.toFixed(0)}% Concluído</p>
               {summary.income > 0 && (
                <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                  Já Faturado: R$ {summary.income.toFixed(2)}
                </p>
               )}
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm dark:shadow-none">
            <h3 className="text-sm font-black italic uppercase mb-6 flex items-center gap-2 text-zinc-900 dark:text-white">
              <PlusCircle size={18} className="text-yellow-500" /> Novo Lançamento
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-gray-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setType("INCOME")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${type === "INCOME" ? "bg-green-500/10 text-green-500" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setType("EXPENSE")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${type === "EXPENSE" ? "bg-red-500/10 text-red-500" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  Saída
                </button>
              </div>

               {/* SELETOR DE PRODUTO OU SERVIÇO (Somente para Entrada) */}
               {type === "INCOME" && (
                   <div className="grid grid-cols-2 gap-4">
                       {/* SELETOR DE SERVIÇOS */}
                        <div className="relative col-span-2 md:col-span-1">
                            <select
                                value={selectedServiceId}
                                onChange={handleServiceChange}
                                className="w-full bg-gray-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs focus:border-yellow-500 outline-none transition-all text-zinc-900 dark:text-white font-bold uppercase tracking-widest appearance-none truncate"
                            >
                                <option value="">-- Serviço --</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            <Scissors size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"/>
                        </div>

                        {/* SELETOR DE PRODUTOS */}
                        <div className="relative col-span-2 md:col-span-1">
                           <select
                               value={selectedStockId}
                               onChange={handleStockChange}
                               className="w-full bg-gray-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs focus:border-yellow-500 outline-none transition-all text-zinc-900 dark:text-white font-bold uppercase tracking-widest appearance-none truncate"
                           >
                               <option value="">-- Produto --</option>
                               {stockItems.map(item => (
                                   <option key={item.id} value={item.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                                       {item.name} ({item.quantity})
                                   </option>
                               ))}
                           </select>
                           <Package size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"/>
                       </div>
                   </div>
               )}

              <div>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição (ex: Corte Degradê)" 
                  className="w-full bg-gray-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700 font-medium text-zinc-900 dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-gray-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-700 font-medium text-zinc-900 dark:text-white" 
                />
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:border-yellow-500 outline-none transition-all text-zinc-900 dark:text-white font-medium appearance-none"
                >
                  <option value="MONEY" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Dinheiro</option>
                  <option value="PIX" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Pix</option>
                  <option value="CARD" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Cartão</option>
                  <option value="OTHER" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Outro</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 ${type === "INCOME" ? "bg-green-500 hover:bg-green-400 text-black shadow-green-500/10" : "bg-red-500 hover:bg-red-400 text-black shadow-red-500/10"}`}
              >
                {loading ? "Salvando..." : type === "INCOME" ? "Adicionar Receita" : "Adicionar Despesa"}
              </button>
            </form>
          </div>

        </div>

        {/* COLUNA DIREITA: Extrato */}
        <div className="md:col-span-7 space-y-6">
          
          {/* FILTRO DE DATA */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-900">
             <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Movimentações de</span>
             </div>
             <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-bold uppercase rounded-lg px-3 py-2 outline-none focus:border-yellow-500"
             />
          </div>

          {/* LISTA */}
          <div className="space-y-3">
            {transactions.length === 0 && (
               <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-3xl">
                  <p className="text-zinc-500 dark:text-zinc-700 font-bold uppercase text-xs tracking-widest">Nenhum registro nesta data</p>
               </div>
            )}

            {transactions.map((t) => (
              <div key={t.id} className="group flex items-center justify-between p-5 bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-800 rounded-2xl transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${t.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">{t.description}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-600 bg-gray-100 dark:bg-zinc-900 px-2 py-1 rounded-md">{t.paymentMethod}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black tracking-tighter ${t.type === 'INCOME' ? 'text-zinc-900 dark:text-white' : 'text-red-500'}`}>
                    {t.type === 'EXPENSE' && '- '}R$ {Number(t.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER DO EXTRATO */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 flex justify-end">
            <button 
              onClick={handleFecharCaixa}
              disabled={transactions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-black/5 dark:shadow-white/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Landmark size={16} /> Fechar Caixa e Imprimir
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}