"use client"

import { StarsRating } from "./rating-stars"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    name: string
    image: string | null
  }
}

interface ReviewListProps {
  reviews: Review[]
}

export const ReviewList = ({ reviews }: ReviewListProps) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 border rounded-lg border-dashed">
        <p>Ainda não há avaliações para esta barbearia.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded-lg space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {review.user.image ? (
                    <img src={review.user.image} alt={review.user.name} className="h-full w-full object-cover" />
                ) : (
                    <span className="text-xs font-bold">{review.user.name[0]}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{review.user.name}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(review.createdAt), "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            <StarsRating rating={review.rating} size={12} />
          </div>
          {review.comment && (
            <p className="text-sm text-foreground/80">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}
