"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle2, Loader2, Store, Edit3, Camera, Clock, Image as ImageIcon, Trash2, Plus, X } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@uploadthing/react";
import { saveBarberServices } from "./_actions/save-services";
import { getBarbershopData } from "./_actions/get-barbershop";

// Sugestões para agilidade
const SUGESTOES_SERVICOS = [
  { nome: "Corte de Cabelo", preco: 35 },
  { nome: "Barba Completa", preco: 25 },
  { nome: "Combo (Corte + Barba)", preco: 55 },
  { nome: "Sobrancelha", preco: 15 },
  { nome: "Pigmentação", preco: 20 },
  { nome: "Pezinho", preco: 10 },
  { nome: "Platinado", preco: 120 },
];

export default function MinhaBarbearia() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"geral" | "galeria">("geral");
  
  // Estados do Formulário
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [imageUrl, setImageUrl] = useState(""); 
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Novo Estado de Serviços Dinâmicos
  const [servicos, setServicos] = useState<{id: string, name: string, price: number}[]>([]);
  const [novoServico, setNovoServico] = useState({ name: "", price: "" }); // Input temporário

  // Estados dos Horários
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
        setPhotos(data.photos || []);
        
        // Carrega serviços existentes
        if (data.BarbershopService && data.BarbershopService.length > 0) {
          setServicos(data.BarbershopService.map((s: any) => ({
             id: s.id,
             name: s.name,
             price: s.priceInCents / 100
          })));
        } else {
           // Se não tiver nada, inicia vazio (sem pré-selecionar)
           setServicos([]);
        }

        if(data.openingTime) setHorarios(h => ({ ...h, abertura: data.openingTime || "" }));
        if(data.closingTime) setHorarios(h => ({ ...h, fechamento: data.closingTime || "" }));
        if(data.lunchStart) setHorarios(h => ({ ...h, almocoInicio: data.lunchStart || "" }));
        if(data.lunchEnd) setHorarios(h => ({ ...h, almocoFim: data.lunchEnd || "" }));
      }
      setFetching(false);
      setMounted(true);
    }
    loadData();
  }, []);

  const handleAddService = () => {
    if (!novoServico.name.trim()) return alert("Digite o nome do serviço");
    if (!novoServico.price) return alert("Digite o preço");

    const novo = {
      id: Math.random().toString(36).substr(2, 9), // ID temporário
      name: novoServico.name,
      price: parseFloat(novoServico.price.replace(",", "."))
    };

    setServicos(prev => [...prev, novo]);
    setNovoServico({ name: "", price: "" }); // Limpa inputs
  };

  const handleRemoveService = (id: string) => {
    if (confirm("Remover este serviço?")) {
      setServicos(prev => prev.filter(s => s.id !== id));
    }
  };

  const addSugestao = (sugestao: { nome: string, preco: number }) => {
    // Evita duplicatas pelo nome
    if (servicos.some(s => s.name === sugestao.nome)) {
       return alert("Este serviço já está na lista!");
    }
    setServicos(prev => [...prev, {
       id: Math.random().toString(36).substr(2, 9),
       name: sugestao.nome,
       price: sugestao.preco
    }]);
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    setPhotos(prev => prev.filter(p => p !== urlToRemove));
  };

  const handleSave = async () => {
    if (!nomeBarbearia.trim()) return alert("Digite o nome da sua barbearia!");
    if (servicos.length === 0) return alert("Adicione pelo menos um serviço!");

    setLoading(true);
    
    // Payload simplificado para o formato esperado pela action
    const payload = servicos.map(s => ({ 
       name: s.name, 
       price: s.price 
    }));

    try {
      await saveBarberServices(
        payload, 
        nomeBarbearia, 
        imageUrl, 
        horarios,
        photos 
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
      <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-zinc-900 dark:text-white p-4 md:p-8 pb-24 transition-colors duration-300">
      <Link href="/" className="flex items-center gap-2 text-yellow-500 mb-6 w-fit hover:opacity-80 transition-opacity">
        <ChevronLeft size={20} />
        <span>Voltar</span>
      </Link>

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Gestão <span className="text-yellow-500">Barbearia</span></h1>
            <p className="text-zinc-500 text-sm font-medium">Configure sua identidade visual e informações</p>
          </div>
          
          <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
             <button 
                onClick={() => setActiveTab("geral")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "geral" ? "bg-yellow-600 text-black shadow-lg shadow-yellow-600/20" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
             >
                Geral
             </button>
             <button 
                onClick={() => setActiveTab("galeria")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "galeria" ? "bg-yellow-600 text-black shadow-lg shadow-yellow-600/20" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
             >
                Galeria
             </button>
          </div>
        </header>

        {activeTab === "geral" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* FOTO DESTAQUE */}
            <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-6 shadow-sm dark:shadow-none">
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 self-start">
                <Camera size={16} className="text-yellow-500" /> Foto de Destaque (Capa)
              </label>
              
              <div className="relative group w-full max-w-md aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-black/50">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white text-xs font-bold uppercase">Alterar Foto</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                    <ImageIcon size={32} />
                    <span className="text-xs font-bold uppercase">Sem foto de capa</span>
                  </div>
                )}
              </div>

              <div className="w-full max-w-md">
                 <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setImageUrl(res[0].url);
                    alert("Foto de capa atualizada!");
                  }}
                  onUploadError={(error: Error) => alert(`Erro: ${error.message}`)}
                  appearance={{
                    button: "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-2 px-4 rounded-xl w-full text-xs uppercase tracking-widest transition-all",
                    container: "w-full",
                    allowedContent: "hidden"
                  }}
                  content={{
                    button({ ready }) { return ready ? (imageUrl ? "ALTERAR CAPA" : "ENVIAR FOTO") : "Carregando..." }
                  }}
                />
              </div>
            </div>

            {/* NOME */}
            <div className="space-y-2">
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Store size={16} className="text-yellow-500" /> Nome da Barbearia
              </label>
              <input 
                type="text"
                value={nomeBarbearia}
                onChange={(e) => setNomeBarbearia(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:border-yellow-600 outline-none transition-all font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                placeholder="Ex: Barber Shop do George"
              />
            </div>

            {/* HORÁRIOS */}
            <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm dark:shadow-none">
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} className="text-yellow-500" /> Horários de Funcionamento
              </label>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold">Abertura</span>
                  <input type="time" value={horarios.abertura} onChange={e => setHorarios({...horarios, abertura: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl focus:border-yellow-600 outline-none text-sm font-bold text-zinc-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-zinc-500 font-bold">Fechamento</span>
                  <input type="time" value={horarios.fechamento} onChange={e => setHorarios({...horarios, fechamento: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl focus:border-yellow-600 outline-none text-sm font-bold text-zinc-900 dark:text-white" />
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800/50 pt-4">
                <p className="text-[10px] text-yellow-600 mb-4 font-black uppercase tracking-widest">Pausa para Almoço (Opcional)</p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold">Início</span>
                    <input type="time" value={horarios.almocoInicio} onChange={e => setHorarios({...horarios, almocoInicio: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl focus:border-yellow-600 outline-none text-sm font-bold text-zinc-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold">Retorno</span>
                    <input type="time" value={horarios.almocoFim} onChange={e => setHorarios({...horarios, almocoFim: e.target.value})} className="w-full bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl focus:border-yellow-600 outline-none text-sm font-bold text-zinc-900 dark:text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* SERVIÇOS (REFATORADO) */}
            <div className="space-y-6">
              <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Edit3 size={16} className="text-yellow-500" /> Serviços e Preços
              </label>

              {/* LISTA DE SERVIÇOS ATIVOS */}
              <div className="space-y-3">
                {servicos.map((servico) => (
                  <div 
                    key={servico.id} 
                    className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm dark:shadow-none"
                  >
                    <div className="flex flex-col">
                       <span className="text-zinc-900 dark:text-white font-bold">{servico.name}</span>
                       <span className="text-zinc-500 text-xs font-bold">R$ {servico.price.toFixed(2)}</span>
                    </div>
                    <button 
                       onClick={() => handleRemoveService(servico.id)}
                       className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-100 dark:bg-zinc-900 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {servicos.length === 0 && (
                   <div className="text-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <p className="text-zinc-600 font-bold uppercase text-xs">Nenhum serviço adicionado</p>
                   </div>
                )}
              </div>

              {/* ADICIONAR NOVO SERVIÇO */}
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm dark:shadow-none">
                 <p className="text-[10px] font-bold uppercase text-zinc-500">Adicionar Novo Serviço</p>
                 <div className="flex gap-2">
                    <input 
                       type="text" 
                       placeholder="Nome (ex: Corte Infantil)" 
                       value={novoServico.name}
                       onChange={(e) => setNovoServico({...novoServico, name: e.target.value})}
                       className="flex-1 bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:border-yellow-600 outline-none text-zinc-900 dark:text-white"
                    />
                    <input 
                       type="number" 
                       placeholder="Preço" 
                       value={novoServico.price}
                       onChange={(e) => setNovoServico({...novoServico, price: e.target.value})}
                       className="w-24 bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:border-yellow-600 outline-none text-zinc-900 dark:text-white"
                    />
                    <button 
                       onClick={handleAddService}
                       className="bg-yellow-600 text-black p-3 rounded-xl hover:bg-yellow-500 transition-all"
                    >
                       <Plus size={20} />
                    </button>
                 </div>

                 {/* SUGESTÕES RÁPIDAS */}
                 <div className="flex flex-wrap gap-2 mt-2">
                    {SUGESTOES_SERVICOS.map((sugestao) => (
                       <button
                          key={sugestao.nome}
                          onClick={() => addSugestao(sugestao)}
                          className="text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-3 py-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-all"
                       >
                          + {sugestao.nome}
                       </button>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* GALERIA DE FOTOS */}
             <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
               <div className="flex justify-between items-center mb-6">
                 <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                   <ImageIcon size={16} className="text-yellow-500" /> Galeria de Fotos
                 </label>
                 <span className="text-xs text-zinc-600 font-bold">{photos.length} fotos</span>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                 {photos.map((photo, index) => (
                   <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-black border border-zinc-200 dark:border-zinc-800">
                      <img src={photo} alt={`Foto ${index}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleRemovePhoto(photo)}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                 ))}
                 
                 {/* Placeholder para upload grid */}
                  <div className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-black/30 flex flex-col items-center justify-center gap-2">
                    <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          // Adiciona novas fotos à lista existente
                          const newPhotos = res.map(r => r.url);
                          setPhotos(prev => [...prev, ...newPhotos]);
                          alert(`${newPhotos.length} foto(s) adicionada(s)!`);
                        }}
                        onUploadError={(error: Error) => alert(`Erro: ${error.message}`)}
                        appearance={{
                          button: "bg-transparent text-zinc-500 hover:text-white w-full h-full",
                          container: "w-full h-full flex items-center justify-center",
                          allowedContent: "hidden"
                        }}
                        content={{
                          button({ ready }) { 
                             return (
                               <div className="flex flex-col items-center gap-2">
                                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-full text-yellow-600 shadow-sm dark:shadow-none border border-zinc-200 dark:border-transparent"><Camera size={20} /></div>
                                  <span className="text-[10px] font-bold uppercase">Adicionar</span>
                                </div>
                             );
                          }
                        }}
                      />
                 </div>
               </div>
               
               <p className="text-[10px] text-zinc-500 text-center uppercase font-bold tracking-widest">
                  Adicione fotos do interior, equipe e resultados para atrair mais clientes.
               </p>
             </div>
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-yellow-600/20 transition-all active:scale-95 text-sm uppercase tracking-widest mb-10"
        >
          {loading ? <Loader2 className="animate-spin" /> : "SALVAR ALTERAÇÕES"}
        </button>
      </div>
    </div>
  );
}