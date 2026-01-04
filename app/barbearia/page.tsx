"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle2, Loader2, Store, Edit3, Camera, Clock, Image as ImageIcon, Trash2, Plus, X, MapPin } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@uploadthing/react";
import { saveBarberServices } from "./_actions/save-services";
import { getBarbershopData } from "./_actions/get-barbershop";
import { getBarbershopProducts, saveBarbershopProduct, deleteBarbershopProduct } from "./_actions/product-actions";

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
  const [activeTab, setActiveTab] = useState<"geral" | "galeria" | "sobre" | "frigobar">("geral");
  
  // Estados do Formulário
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [imageUrl, setImageUrl] = useState(""); 
  const [photos, setPhotos] = useState<string[]>([]);
  const [aboutUs, setAboutUs] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [barbershopId, setBarbershopId] = useState("");
  
  // Novo Estado de Serviços Dinâmicos
  const [servicos, setServicos] = useState<{id: string, name: string, price: number}[]>([]);
  const [novoServico, setNovoServico] = useState({ name: "", price: "" }); // Input temporário

  // Estado do Frigobar
  const [products, setProducts] = useState<{id: string, name: string, price: number, quantity: number}[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "" });

  // Estados dos Horários
  const [horarios, setHorarios] = useState({
    abertura: "08:00",
    almocoInicio: "",
    almocoFim: "",
    fechamento: "18:00"
  });

  useEffect(() => {
    async function loadData() {
      const data = await getBarbershopData() as any;
      if (data) {
        setBarbershopId(data.id);
        setNomeBarbearia(data.name);
        setImageUrl(data.imageUrl || "");
        setPhotos(data.photos || []);
        setAboutUs(data.aboutUs || "");
        if (data.latitude) setLatitude(data.latitude.toString());
        if (data.longitude) setLongitude(data.longitude.toString());
        
        // Carrega serviços existentes
        if (data.BarbershopService && data.BarbershopService.length > 0) {
          setServicos(data.BarbershopService.map((s: any) => ({
             id: s.id,
             name: s.name,
             price: s.priceInCents / 100
          })));
        } else {
           setServicos([]);
        }

        if(data.openingTime) setHorarios(h => ({ ...h, abertura: data.openingTime || "" }));
        if(data.closingTime) setHorarios(h => ({ ...h, fechamento: data.closingTime || "" }));
        if(data.lunchStart) setHorarios(h => ({ ...h, almocoInicio: data.lunchStart || "" }));
        if(data.lunchEnd) setHorarios(h => ({ ...h, almocoFim: data.lunchEnd || "" }));
        
        // Load products
        const productsRes = await getBarbershopProducts(data.id);
        if (productsRes.success && productsRes.products) {
            setProducts(productsRes.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.priceInCents / 100,
                quantity: p.quantity
            })));
        }
      }
      setFetching(false);
      setMounted(true);
    }
    loadData();
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) return alert("Nome do produto obrigatório");
    if (!newProduct.price) return alert("Preço obrigatório");
    if (!barbershopId) return alert("Erro: Barbearia não identificada");

    const price = parseFloat(newProduct.price.replace(",", "."));
    const quantity = parseInt(newProduct.quantity) || 0;

    const res = await saveBarbershopProduct({
        name: newProduct.name,
        price,
        quantity,
        barbershopId
    });

    if (res.success) {
        alert("Produto adicionado!");
        setNewProduct({ name: "", price: "", quantity: "" });
        // Reload products
        const productsRes = await getBarbershopProducts(barbershopId);
        if (productsRes.success && productsRes.products) {
            setProducts(productsRes.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.priceInCents / 100,
                quantity: p.quantity
            })));
        }
    } else {
        alert(`Erro ao adicionar: ${res.error}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if(confirm("Excluir este produto?")) {
        const res = await deleteBarbershopProduct(id);
        if (res.success) {
            setProducts(prev => prev.filter(p => p.id !== id));
        } else {
            alert("Erro ao excluir produto");
        }
    }
  };

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
      const result = await saveBarberServices(
        payload, 
        nomeBarbearia, 
        imageUrl, 
        horarios,
        photos,
        {
          latitude: latitude ? parseFloat(latitude.replace(",", ".")) : null,
          longitude: longitude ? parseFloat(longitude.replace(",", ".")) : null
        },
        aboutUs
      );
      
      if (result && result.success) {
          alert("✅ Configurações salvas com sucesso!");
      } else {
          // @ts-ignore
          alert(`❌ Erro ao salvar: ${result?.error || "Desconhecido"}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`❌ Erro inesperado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 pb-24 transition-colors duration-500">
      <Link href="/" className="flex items-center gap-2 text-brand-primary mb-6 w-fit hover:opacity-80 transition-opacity">
        <ChevronLeft size={20} />
        <span className="font-bold uppercase text-xs tracking-widest">Voltar</span>
      </Link>

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter italic">Gestão <span className="text-brand-primary">Barbearia</span></h1>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Identidade Visual e Informações</p>
          </div>
          
          <div className="flex bg-card p-1 rounded-xl border border-border">
             <button 
                onClick={() => setActiveTab("geral")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "geral" ? "bg-brand-primary text-primary-foreground shadow-lg shadow-brand-primary/20" : "text-muted-foreground hover:text-foreground"}`}
             >
                Geral
             </button>
             <button 
                onClick={() => setActiveTab("sobre")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "sobre" ? "bg-brand-primary text-primary-foreground shadow-lg shadow-brand-primary/20" : "text-muted-foreground hover:text-foreground"}`}
             >
                Sobre nós
             </button>
             <button 
                onClick={() => setActiveTab("frigobar")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "frigobar" ? "bg-brand-primary text-primary-foreground shadow-lg shadow-brand-primary/20" : "text-muted-foreground hover:text-foreground"}`}
             >
                Frigobar
             </button>
             <button 
                onClick={() => setActiveTab("galeria")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "galeria" ? "bg-brand-primary text-primary-foreground shadow-lg shadow-brand-primary/20" : "text-muted-foreground hover:text-foreground"}`}
             >
                Galeria
             </button>
          </div>
        </header>

        {activeTab === "geral" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* FOTO DESTAQUE */}
            <div className="bg-card border border-border p-6 rounded-[2rem] flex flex-col items-center gap-6 shadow-sm">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 self-start">
                <Camera size={16} className="text-brand-primary" /> Foto de Destaque (Capa)
              </label>
              
              <div className="relative group w-full max-w-md aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-border bg-background/50">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white text-xs font-bold uppercase tracking-widest">Alterar Foto</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sem foto de capa</span>
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
                    button: "bg-muted hover:bg-background border border-border text-foreground font-black py-4 px-4 rounded-xl w-full text-[10px] uppercase tracking-[0.2em] transition-all",
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
            <div className="space-y-4">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Store size={16} className="text-brand-primary" /> Nome da Barbearia
              </label>
              <input 
                type="text"
                value={nomeBarbearia}
                onChange={(e) => setNomeBarbearia(e.target.value)}
                className="w-full bg-card border border-border rounded-xl p-4 focus:border-brand-primary outline-none transition-all font-black uppercase text-sm tracking-widest text-foreground placeholder:text-muted-foreground"
                placeholder="Ex: Barber Shop do George"
              />
            </div>

            {/* LOCALIZAÇÃO (RADAR) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} className="text-brand-primary" /> Latitude
                </label>
                <input 
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl p-4 focus:border-brand-primary outline-none transition-all font-black text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder="-23.5505"
                />
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} className="text-brand-primary" /> Longitude
                </label>
                <input 
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl p-4 focus:border-brand-primary outline-none transition-all font-black text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder="-46.6333"
                />
              </div>
            </div>

            {/* HORÁRIOS */}
            <div className="bg-card p-6 rounded-[2rem] border border-border space-y-6 shadow-sm">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} className="text-brand-primary" /> Horários de Funcionamento
              </label>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Abertura</span>
                  <input type="time" value={horarios.abertura} onChange={e => setHorarios({...horarios, abertura: e.target.value})} className="w-full bg-muted border border-border p-4 rounded-xl focus:border-brand-primary outline-none text-sm font-black text-foreground" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Fechamento</span>
                  <input type="time" value={horarios.fechamento} onChange={e => setHorarios({...horarios, fechamento: e.target.value})} className="w-full bg-muted border border-border p-4 rounded-xl focus:border-brand-primary outline-none text-sm font-black text-foreground" />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-brand-primary mb-4 font-black uppercase tracking-[0.2em]">Pausa para Almoço (Opcional)</p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Início</span>
                    <input type="time" value={horarios.almocoInicio} onChange={e => setHorarios({...horarios, almocoInicio: e.target.value})} className="w-full bg-muted border border-border p-4 rounded-xl focus:border-brand-primary outline-none text-sm font-black text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Retorno</span>
                    <input type="time" value={horarios.almocoFim} onChange={e => setHorarios({...horarios, almocoFim: e.target.value})} className="w-full bg-muted border border-border p-4 rounded-xl focus:border-brand-primary outline-none text-sm font-black text-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* SERVIÇOS (REFATORADO) */}
            <div className="space-y-6">
              <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Edit3 size={16} className="text-brand-primary" /> Serviços e Preços
              </label>

              {/* LISTA DE SERVIÇOS ATIVOS */}
              <div className="space-y-3">
                {servicos.map((servico) => (
                  <div 
                    key={servico.id} 
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40 group hover:border-brand-primary/30 transition-all shadow-sm"
                  >
                    <div className="flex flex-col">
                       <span className="text-foreground font-black uppercase text-xs tracking-wider">{servico.name}</span>
                       <span className="text-brand-primary text-xs font-black">R$ {servico.price.toFixed(2)}</span>
                    </div>
                    <button 
                       onClick={() => handleRemoveService(servico.id)}
                       className="p-2 text-muted-foreground hover:text-red-500 bg-muted hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {servicos.length === 0 && (
                   <div className="text-center p-8 border-2 border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Nenhum serviço adicionado</p>
                   </div>
                )}
              </div>

              {/* ADICIONAR NOVO SERVIÇO */}
              <div className="bg-card p-4 rounded-2xl border border-border space-y-4 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Adicionar Novo Serviço</p>
                 <div className="flex gap-2">
                    <input 
                       type="text" 
                       placeholder="Nome (ex: Corte Infantil)" 
                       value={novoServico.name}
                       onChange={(e) => setNovoServico({...novoServico, name: e.target.value})}
                       className="flex-1 bg-muted border border-border rounded-xl p-3 text-sm focus:border-brand-primary outline-none text-foreground font-bold tracking-widest placeholder:text-muted-foreground"
                    />
                    <input 
                       type="number" 
                       placeholder="Preço" 
                       value={novoServico.price}
                       onChange={(e) => setNovoServico({...novoServico, price: e.target.value})}
                       className="w-24 bg-muted border border-border rounded-xl p-3 text-sm focus:border-brand-primary outline-none text-foreground font-bold tracking-widest placeholder:text-muted-foreground"
                    />
                    <button 
                       onClick={handleAddService}
                       className="bg-brand-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-primary/10"
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
                          className="text-[10px] font-black uppercase bg-muted text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-brand-primary/10 hover:text-brand-primary transition-all border border-transparent hover:border-brand-primary/20"
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
             <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm">
               <div className="flex justify-between items-center mb-6">
                 <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <ImageIcon size={16} className="text-brand-primary" /> Galeria de Fotos
                 </label>
                 <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{photos.length} fotos</span>
               </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border border-border transition-all hover:border-brand-primary/30">
                       <img src={photo} alt={`Foto ${index}`} className="w-full h-full object-cover" />
                       <button 
                         onClick={() => handleRemovePhoto(photo)}
                         className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-400 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100 shadow-lg"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  ))}
                  
                  {/* Placeholder para upload grid */}
                   <div className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 hover:border-brand-primary/50 transition-all group relative">
                     <UploadButton
                         endpoint="imageUploader"
                         onClientUploadComplete={(res) => {
                           // Adiciona novas fotos à lista existente
                           const newPhotos = (res as any[]).map(r => r.url);
                           setPhotos(prev => [...prev, ...newPhotos]);
                           alert(`${newPhotos.length} foto(s) adicionada(s)!`);
                         }}
                         onUploadError={(error: Error) => alert(`Erro: ${error.message}`)}
                         appearance={{
                           button: "bg-transparent text-transparent w-full h-full absolute inset-0 z-10 cursor-pointer",
                           container: "w-full h-full flex items-center justify-center",
                           allowedContent: "hidden"
                         }}
                         content={{
                           button() { return "" }
                         }}
                       />
                       <div className="flex flex-col items-center gap-2 pointer-events-none group-hover:text-brand-primary transition-colors">
                          <div className="p-3 bg-card border border-border rounded-full text-brand-primary shadow-sm group-hover:border-brand-primary/30"><Camera size={20} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Adicionar</span>
                       </div>
                  </div>
                </div>
                
                <p className="text-[10px] text-muted-foreground text-center uppercase font-black tracking-widest leading-relaxed">
                   Adicione fotos do interior, equipe e resultados para atrair mais clientes.
                </p>
             </div>
          </div>
        )}

        {activeTab === "sobre" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-4">
                     <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Store size={16} className="text-brand-primary" /> Sobre a Barbearia
                     </label>
                     <p className="text-xs text-muted-foreground">Conte um pouco sobre a história da sua barbearia, seus valores e o que a torna especial.</p>
                     
                     <textarea
                        value={aboutUs}
                        onChange={(e) => setAboutUs(e.target.value)}
                        className="w-full h-48 bg-muted border border-border rounded-xl p-4 focus:border-brand-primary outline-none transition-all text-sm text-foreground resize-none"
                        placeholder="Ex: Fundada em 2020, nossa barbearia..."
                     />
                </div>
            </div>
        )}

        {activeTab === "frigobar" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-6">
                     <div className="flex justify-between items-center">
                        <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Clock size={16} className="text-brand-primary" /> Itens do Frigobar
                        </label>
                        <span className="text-[10px] font-black bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full">{products.length} Itens</span>
                     </div>

                     {/* Form */}
                     <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Adicionar Novo Item</p>
                        <div className="flex flex-wrap gap-2">
                            <input 
                                type="text"
                                placeholder="Nome (Ex: Coca-Cola)"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                className="flex-1 min-w-[150px] bg-background border border-border rounded-lg p-2 text-xs font-bold"
                            />
                            <input 
                                type="number"
                                placeholder="Preço"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                className="w-24 bg-background border border-border rounded-lg p-2 text-xs font-bold"
                            />
                            <input 
                                type="number"
                                placeholder="Qtd"
                                value={newProduct.quantity}
                                onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                                className="w-20 bg-background border border-border rounded-lg p-2 text-xs font-bold"
                            />
                            <button 
                                onClick={handleAddProduct}
                                className="bg-brand-primary text-primary-foreground px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider hover:opacity-90"
                            >
                                Adicionar
                            </button>
                        </div>
                     </div>

                     {/* Lista */}
                     <div className="space-y-3">
                        {products.length > 0 ? products.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm uppercase">{product.name}</span>
                                    <span className="text-xs text-muted-foreground">{product.quantity} un • R$ {product.price.toFixed(2)}</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-muted-foreground/50 text-xs uppercase font-black tracking-widest">
                                Nenhum item no frigobar
                            </div>
                        )}
                     </div>
                </div>
            </div>
        )}

        {/* Botão SALVAR apenas se NÃO for Frigobar (já salva direto) ou se quiser salvar o About US na aba Sobre */}
        {activeTab !== 'frigobar' && (
             <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-brand-primary text-primary-foreground font-black py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-primary/20 transition-all active:scale-95 text-[10px] uppercase tracking-[0.2em] mb-10 h-14"
            >
              {loading ? <Loader2 className="animate-spin" /> : "SALVAR ALTERAÇÕES"}
            </button>
        )}
      </div>
    </div>
  );
}