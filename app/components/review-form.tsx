"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog"
import { Star, Loader2 } from "lucide-react"
import { createBarbershopReview } from "@/app/_actions/review-actions"
import { toast } from "sonner"

const formSchema = z.object({
  rating: z.number().min(1, "Selecione pelo menos uma estrela").max(5),
  comment: z.string().optional(),
})

interface ReviewFormProps {
  barbershopId: string
  userId: string
  initialData?: {
    rating: number
    comment?: string | null
  }
}

// Simple Button component if Sidebar.tsx doesn't export a generic one
const BaseButton = ({ children, className, ...props }: any) => (
  <button 
    className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 ${className}`} 
    {...props}
  >
    {children}
  </button>
)

export const ReviewForm = ({ barbershopId, userId, initialData }: ReviewFormProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: initialData?.rating || 0,
      comment: initialData?.comment || "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await createBarbershopReview({
        barbershopId,
        userId,
        rating: values.rating,
        comment: values.comment,
      })
      toast.success("Avaliação enviada com sucesso!")
      setIsOpen(false)
    } catch (error) {
      toast.error("Erro ao enviar avaliação.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <BaseButton className="bg-primary text-primary-foreground hover:bg-primary/90">
          {initialData ? "Editar minha avaliação" : "Avaliar agora"}
        </BaseButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Avaliar Barbearia</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={32}
                    className={`cursor-pointer transition-colors ${
                    star <= form.watch("rating")
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => form.setValue("rating", star)}
                />
                ))}
            </div>
            {form.formState.errors.rating && (
                <p className="text-xs text-red-500 text-center">{form.formState.errors.rating.message}</p>
            )}
            
            <div className="space-y-2">
                <label className="text-sm font-medium">Seu comentário (opcional)</label>
                <textarea
                    placeholder="Conte sua experiência..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register("comment")}
                />
            </div>
        </div>
        <DialogFooter>
            <BaseButton 
                onClick={form.handleSubmit(onSubmit)} 
                className="w-full bg-primary text-primary-foreground" 
                disabled={isSubmitting}
            >
                {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
            </BaseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
