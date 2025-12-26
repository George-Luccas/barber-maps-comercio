"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle2, Loader2, Store, Edit3, Camera, Clock } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@uploadthing/react";
import { ourFileRouter } from "../api/uploadthing/core";
import { saveBarberServices } from "./_actions/save-services";
import { getBarbershopData } from "./_actions/get-barbershop";

const SERVICOS_PADRAO = [
  { id: "corte", nome: "Corte de Cabelo", valor: 35 },
  { id: "barba", nome: "Barba Completa", valor: 25 },
  { id: "combo", nome: "Combo (Corte + Barba)", valor: 55 },
  { id: "sobrancelha", nome: "Sobrancelha", valor: 15 },
  { id: "pigmentacao", nome: "Pigmentação", valor: 20 },
];

export default function MinhaBarbearia() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Estados do Formulário
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [precos, setPrecos] = useState<Record<string, number>>(
    SERVICOS_PADRAO.reduce((acc, s) => ({ ...acc, [s.id]: s.valor }), {})
  );

  // Estados dos Horários (4 campos conforme solicitado)
  const [horarios, setHorarios] = useState({
    abertura: "08:00",
    almocoInicio: "",
    almocoFim: "",
    fechamento: "18:00"
  });

  useEffect(() => {
    async function loadData() {
      const data = await getBarbershopData();
      if (data) {
        setNomeBarbearia(data.name);
        setImageUrl(data.imageUrl || "");
        
        const idsSalvos: string[] = [];
        const precosSalvos = { ...precos };

        data.services.forEach((service: any) => {
          const padrao = SERVICOS_PADRAO.find(s => s.nome === service.name);
          if (padrao) {
            idsSalvos.push(padrao.id);
            precosSalvos[padrao.id] = service.priceInCents / 100;
          }
        });

        setSelecionados(idsSalvos);
        setPrecos(precosSalvos);
      }
      setFetching(false);
      setMounted(true);
    }
    loadData();
  }, []);

  const toggleServico = (id: string) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePrecoChange = (id: string, novoValor: string) => {
    const valorNumerico = parseFloat(novoValor.replace(",", "."));
    setPrecos(prev => ({ ...prev, [id]: isNaN(valorNumerico) ? 0 : valorNumerico }));
  };

  const handleSave = async () => {
    if (!nomeBarbearia.trim()) return alert("Digite o nome da sua barbearia!");
    if (selecionados.length === 0) return alert("Selecione pelo menos um serviço!");

    setLoading(true);
    const payload = SERVICOS_PADRAO
      .filter(s => selecionados.includes(s.id))
      .map(s => ({ name: s.nome, price: precos[s.id] }));

    try {
      // ✅ AGORA ENVIANDO OS 4 PARÂMETROS NA ORDEM CORRETA:
      await saveBarberServices(
        payload, 
        nomeBarbearia, 
        imageUrl, 
        horarios
      );
      alert("✅ Configurações salvas com sucesso!");
    } catch (error) {
      console.error(error);
      alert("❌ Erro ao salvar as configurações.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || fetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-24">
      <Link href="/" className="flex items-center gap-2 text-yellow-500 mb-6 w-fit">
        <ChevronLeft size={20} />
        <span>Voltar</span>
      </Link>

      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-bold">Gestão da Barbearia</h1>
          <p className="text-gray-400">Configure sua identidade e horários</p>
        </header>

        {/* FOTO */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center gap-4">
          <label className="text-zinc-400 text-sm font-bold flex items-center gap-2 self-start">
            <Camera size={16} /> FOTO DO ESTABELECIMENTO
          </label>
          
          {imageUrl ? (
            <img src={imageUrl} className="w-full h-48 object-cover rounded-xl border-2 border-yellow-600 shadow-lg shadow-yellow-600/10" />
          ) : (
            <div className="w-full h-48 bg-black rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600">
              Ainda sem foto
            </div>
          )}

          <UploadButton
  endpoint="imageUploader"
  onClientUploadComplete={(res) => {
    setImageUrl(res[0].url);
    alert("Foto enviada com sucesso!");
  }}
  onUploadError={(error: Error) => alert(`Erro: ${error.message}`)}
  // A MÁGICA ESTÁ AQUI:
  content={{
    button({ ready }) {
      if (ready) return "SELECIONAR FOTO";
      return "CARREGANDO...";
    },
    allowedContent: "Imagens até 4MB"
  }}
  appearance={{
    button: "bg-yellow-600 hover:bg-yellow-500 text-black font-black py-3 px-6 rounded-xl w-full transition-all duration-300 shadow-lg shadow-yellow-600/20 after:bg-yellow-600",
    container: "w-full",
    allowedContent: "text-zinc-500 text-[10px] uppercase font-bold mt-2"
  }}
/>
        </div>

        {/* NOME */}
        <div className="space-y-2">
          <label className="text-zinc-400 text-sm font-bold flex items-center gap-2">
            <Store size={16} /> NOME DA BARBEARIA
          </label>
          <input 
            type="text"
            value={nomeBarbearia}
            onChange={(e) => setNomeBarbearia(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 focus:border-yellow-600 outline-none transition-all"
            placeholder="Ex: Barber Shop do George"
          />
        </div>

        {/* HORÁRIOS (4 campos conforme solicitado) */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <label className="text-zinc-400 text-sm font-bold flex items-center gap-2">
            <Clock size={16} /> HORÁRIOS DE FUNCIONAMENTO
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Abertura</span>
              <input type="time" value={horarios.abertura} onChange={e => setHorarios({...horarios, abertura: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-yellow-600 outline-none" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-zinc-500 font-bold">Fechamento</span>
              <input type="time" value={horarios.fechamento} onChange={e => setHorarios({...horarios, fechamento: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-yellow-600 outline-none" />
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 mt-4">
            <p className="text-[10px] text-yellow-600 mb-4 font-black uppercase tracking-widest">Pausa para Almoço (Deixe vazio se não houver)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Saída</span>
                <input type="time" value={horarios.almocoInicio} onChange={e => setHorarios({...horarios, almocoInicio: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-yellow-600 outline-none" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Retorno</span>
                <input type="time" value={horarios.almocoFim} onChange={e => setHorarios({...horarios, almocoFim: e.target.value})} className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-yellow-600 outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* SERVIÇOS */}
        <div className="space-y-4">
          <label className="text-zinc-400 text-sm font-bold flex items-center gap-2">
            <Edit3 size={16} /> SELECIONE SEUS SERVIÇOS E PREÇOS
          </label>
          <div className="grid gap-3">
            {SERVICOS_PADRAO.map((servico) => (
              <div 
                key={servico.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  selecionados.includes(servico.id) ? "border-yellow-600 bg-yellow-600/5" : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleServico(servico.id)}>
                  {selecionados.includes(servico.id) ? (
                    <CheckCircle2 size={22} className="text-yellow-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-700" />
                  )}
                  <span className={selecionados.includes(servico.id) ? "text-white font-bold" : "text-zinc-500"}>
                    {servico.nome}
                  </span>
                </div>

                {selecionados.includes(servico.id) && (
                  <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-lg px-3 py-1">
                    <span className="text-yellow-600 text-xs font-bold">R$</span>
                    <input 
                      type="text"
                      value={precos[servico.id]}
                      onChange={(e) => handlePrecoChange(servico.id, e.target.value)}
                      className="bg-transparent w-12 text-sm outline-none font-bold text-right text-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-yellow-600/20 transition-all active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" /> : "SALVAR TODAS AS CONFIGURAÇÕES"}
        </button>
      </div>
    </div>
  );
}