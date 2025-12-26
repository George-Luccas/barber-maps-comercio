"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Target, Landmark, ArrowUpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf"; // Certifique-se de rodar: npm install jspdf

export default function FinancialManager() {
  const [meta, setMeta] = useState(500);
  const [atual, setAtual] = useState(350);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const metaSalva = localStorage.getItem("meta_estipulada");
    if (metaSalva) setMeta(Number(metaSalva));
  }, []);

  const progresso = Math.min((atual / meta) * 100, 100);
  const faltante = Math.max(meta - atual, 0);

  const alterarMeta = () => {
    const novaMeta = prompt("Defina sua meta diária:", meta.toString());
    if (novaMeta && !isNaN(Number(novaMeta))) {
      const valorNumerico = Number(novaMeta);
      setMeta(valorNumerico);
      localStorage.setItem("meta_estipulada", valorNumerico.toString());
      window.dispatchEvent(new Event("storage"));
    }
  };

  // --- NOVA FUNÇÃO DE FECHAMENTO ---
  const handleFecharCaixa = () => {
    const confirmar = confirm("Deseja encerrar o caixa e gerar o relatório em PDF?");
    
    if (confirmar) {
      const doc = new jsPDF();
      const dataHoje = new Date().toLocaleDateString('pt-BR');

      // Cabeçalho do PDF
      doc.setFontSize(22);
      doc.setTextColor(234, 179, 8); // Cor Amarela BarberMaps
      doc.text("BARBER MAPS - RELATÓRIO", 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Data do Fechamento: ${dataHoje}`, 20, 30);
      doc.line(20, 35, 190, 35);

      // Resumo Financeiro
      doc.setFontSize(16);
      doc.text("Resumo de Vendas", 20, 50);
      
      doc.setFontSize(12);
      doc.text(`Meta Estabelecida: R$ ${meta.toFixed(2)}`, 20, 65);
      doc.text(`Total Faturado: R$ ${atual.toFixed(2)}`, 20, 75);
      
      const percentual = ((atual / meta) * 100).toFixed(1);
      doc.text(`Desempenho: ${percentual}% da meta atingida`, 20, 85);

      if (atual >= meta) {
        doc.setTextColor(0, 128, 0);
        doc.text("Status: META BATIDA COM SUCESSO! 🔥", 20, 100);
      } else {
        doc.setTextColor(200, 0, 0);
        doc.text(`Status: Faltaram R$ ${faltante.toFixed(2)} para a meta.`, 20, 100);
      }

      // Rodapé
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text("Este documento serve como comprovante de fechamento diário.", 20, 280);

      // Download
      doc.save(`fechamento_${dataHoje.replace(/\//g, '-')}.pdf`);
      
      // Zera o caixa após o fechamento
      setAtual(0);
      alert("Caixa fechado e PDF gerado!");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6 bg-black min-h-screen text-white font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors p-1">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black text-xl">B</div>
            <h1 className="text-white font-bold tracking-tighter text-lg leading-none">
              BARBER <span className="text-yellow-500">MAPS</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="p-4 flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* PAINEL DE METAS */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-zinc-400 text-xs uppercase font-bold mb-1">Faturamento Hoje</p>
              <h2 className="text-4xl font-black text-white">R$ {atual},00</h2>
            </div>
            <button onClick={alterarMeta} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-yellow-500 transition active:scale-90">
              <Target size={20} />
            </button>
          </div>

          <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden mt-2">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000"
              style={{ width: `${progresso}%` }}
            />
          </div>

          <div className="flex justify-between mt-3 items-center">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">{progresso.toFixed(0)}% da meta</p>
            {faltante > 0 ? (
              <p className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                <ArrowUpCircle size={12} /> Faltam R$ {faltante},00
              </p>
            ) : (
              <p className="text-xs font-bold text-green-500">Meta Batida! 🔥</p>
            )}
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-sm font-bold mb-5 flex items-center gap-2 uppercase tracking-wider text-zinc-200">
            <PlusCircle size={18} className="text-yellow-500" /> Novo Lançamento
          </h3>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Descrição do Serviço</label>
              <input type="text" placeholder="Ex: Cabelo + Barba" className="w-full bg-zinc-800 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-yellow-500 transition-all outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Valor (R$)</label>
                <input type="number" placeholder="0,00" className="w-full bg-zinc-800 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-yellow-500 transition-all outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Pagamento</label>
                <select className="w-full bg-zinc-800 border-none rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-yellow-500 transition-all outline-none text-white">
                  <option>Pix</option>
                  <option>Dinheiro</option>
                  <option>Cartão</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl mt-2 transition-all shadow-lg active:scale-95">
              CONFIRMAR RECEBIMENTO
            </button>
          </form>
        </div>

        {/* BOTAO DE FECHAMENTO (AJUSTADO) */}
        <div className="mt-2">
          <button 
            onClick={handleFecharCaixa}
            className="w-full group flex items-center justify-center gap-2 py-4 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-white hover:bg-red-950/30 hover:border-red-900 transition-all"
          >
            <Landmark size={18} className="group-hover:text-red-500" />
            <span className="font-bold text-xs uppercase tracking-widest">Fechar Caixa do Dia</span>
          </button>
        </div>
      </div>
    </div>
  );
}