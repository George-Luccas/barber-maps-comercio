"use client"

import { Star, StarHalf } from "lucide-react"

interface StarsRatingProps {
  rating: number
  max?: number
  size?: number
  className?: string
}

export const StarsRating = ({ rating, max = 5, size = 16, className }: StarsRatingProps) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 != 0
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} className="fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && <StarHalf size={size} className="fill-yellow-400 text-yellow-400" />}
      {[...Array(Math.max(0, emptyStars))].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300" />
      ))}
    </div>
  )
}

interface RatingSummaryProps {
  average: number
  count: number
  showCount?: boolean
}

export const RatingSummary = ({ average, count, showCount = true }: RatingSummaryProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold">{average.toFixed(1)}</span>
      <StarsRating rating={average} size={14} />
      {showCount && <span className="text-xs text-gray-400">({count} avaliações)</span>}
    </div>
  )
}
