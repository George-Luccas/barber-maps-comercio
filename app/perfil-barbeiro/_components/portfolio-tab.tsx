"use client"

import { useState } from "react"
import { Image as ImageIcon, Plus, Trash2, X } from "lucide-react"
import { UploadButton } from "@/app/_lib/uploadthing"
import { addPortfolioItem, deletePortfolioItem } from "../_actions/portfolio"

interface GalleryImage {
  id: string
  imageUrl: string
  description: string | null
}

interface PortfolioTabProps {
  initialImages: GalleryImage[]
}

export default function PortfolioTab({ initialImages }: PortfolioTabProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  
  // State for new upload
  const [newImageDesc, setNewImageDesc] = useState("")

  async function handleUploadComplete(res: { url: string }[]) {
    if (!res || res.length === 0) return

    const imageUrl = res[0].url
    
    // Save to DB via Server Action
    const result = await addPortfolioItem({
      imageUrl,
      description: newImageDesc || undefined
    })

    if (result.success) {
      // Reload page or optimistic update? Page reload feels safer for now to sync everything
      window.location.reload()
    } else {
      alert("Erro ao salvar imagem na galeria.")
    }
    
    setIsAddingNew(false)
    setNewImageDesc("")
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return
    
    const result = await deletePortfolioItem(id)
    if (result.success) {
      setImages(images.filter(img => img.id !== id))
    } else {
      alert("Erro ao excluir imagem.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-foreground uppercase tracking-wider">Galeria de Trabalhos</h3>
          <p className="text-sm text-muted-foreground">Mostre seus melhores cortes e estilos</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-primary-foreground rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-brand-primary/80 transition-all"
        >
          <Plus size={16} />
          Adicionar Foto
        </button>
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Nenhum trabalho cadastrado</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Adicione fotos dos seus cortes para atrair mais clientes
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-primary-foreground rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-brand-primary/80 transition-all"
          >
            <Plus size={20} />
            Adicionar Primeiro Trabalho
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div 
              key={image.id} 
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border cursor-pointer hover:border-brand-primary/50 transition-all"
              onClick={() => setSelectedImage(image)}
            >
              <img 
                src={image.imageUrl} 
                alt={image.description || "Trabalho"} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Description */}
                {image.description && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-xs font-medium truncate">
                      {image.description}
                    </p>
                  </div>
                )}
                {/* Delete Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(image.id); }}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add New */}
      {isAddingNew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-foreground uppercase">Adicionar Foto</h3>
              <button onClick={() => setIsAddingNew(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={newImageDesc}
                  onChange={(e) => setNewImageDesc(e.target.value)}
                  placeholder="Ex: Degradê navalhado"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground mb-4"
                />
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-muted/20">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={(error: Error) => {
                    alert(`ERRO: ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-brand-primary text-primary-foreground font-bold uppercase tracking-wider",
                    allowedContent: "text-muted-foreground text-xs"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage.imageUrl} 
            alt={selectedImage.description || "Trabalho"} 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
          {selectedImage.description && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-medium bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
              {selectedImage.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
