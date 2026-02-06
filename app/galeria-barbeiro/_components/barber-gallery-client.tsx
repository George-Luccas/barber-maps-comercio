"use client"

import { useState } from "react"
import { Image as ImageIcon, Plus, Trash2, X, Sparkles } from "lucide-react"
import Sidebar from "@/app/components/Sidebar"

interface GalleryImage {
  id: string;
  imageUrl: string;
  description: string;
}

interface BarberGalleryProps {
  userId: string;
  userName: string;
  images: GalleryImage[];
}

export default function BarberGalleryClient({ userId, userName, images }: BarberGalleryProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(images)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newImage, setNewImage] = useState({ imageUrl: "", description: "" })
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const handleAddImage = async () => {
    if (!newImage.imageUrl) {
      alert("Informe a URL da imagem")
      return
    }

    // TODO: Implement API call to save image
    const tempId = Date.now().toString()
    setGalleryImages([...galleryImages, { id: tempId, ...newImage }])
    setNewImage({ imageUrl: "", description: "" })
    setIsAddingNew(false)
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return
    
    // TODO: Implement API call to delete image
    setGalleryImages(galleryImages.filter(img => img.id !== imageId))
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="p-6 md:p-10 md:ml-64">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="text-brand-primary" size={28} />
              <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter italic">
                Meus Trabalhos
              </h1>
            </div>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Galeria de Cortes e Estilos
            </p>
          </div>

          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-primary-foreground rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-brand-primary/80 transition-all"
          >
            <Plus size={20} />
            Adicionar
          </button>
        </div>

        {/* Add New Image Modal */}
        {isAddingNew && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-foreground uppercase">Novo Trabalho</h3>
                <button onClick={() => setIsAddingNew(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={newImage.imageUrl}
                    onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={newImage.description}
                    onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                    placeholder="Ex: Degradê com barba"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </div>

                {newImage.imageUrl && (
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={newImage.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <button
                  onClick={handleAddImage}
                  className="w-full py-4 bg-brand-primary text-primary-foreground rounded-xl font-bold uppercase tracking-wider hover:bg-brand-primary/80 transition-all"
                >
                  Salvar Imagem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
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
              alt={selectedImage.description} 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            />
            {selectedImage.description && (
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-center font-medium bg-black/50 px-6 py-2 rounded-full">
                {selectedImage.description}
              </p>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        {galleryImages.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Nenhum trabalho cadastrado</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Adicione fotos dos seus cortes e estilos para mostrar seu trabalho
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
            {galleryImages.map((image) => (
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
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium truncate">
                      {image.description || "Sem descrição"}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteImage(image.id); }}
                    className="absolute top-3 right-3 p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
