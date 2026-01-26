'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Star, User } from 'lucide-react'
import { aggiungiRecensione } from '@/lib/actions/events'

interface Review {
  id: string
  rating: number
  commento: string | null
  created_at: string
  users: { nome: string; cognome: string } | null
}

interface ReviewSectionProps {
  eventId: string
  reviews: Review[]
  isPast: boolean
  isLoggedIn: boolean
  hasReviewed: boolean
}

export default function ReviewSection({
  eventId,
  reviews,
  isPast,
  isLoggedIn,
  hasReviewed,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [commento, setCommento] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Seleziona una valutazione')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('event_id', eventId)
    formData.append('rating', rating.toString())
    formData.append('commento', commento)

    const result = await aggiungiRecensione(formData)

    if (result.success) {
      setSuccess(true)
      setRating(0)
      setCommento('')
    } else {
      setError(result.error || 'Errore durante l\'invio della recensione')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Recensioni ({reviews.length})
      </h2>

      {/* Add Review Form */}
      {isPast && isLoggedIn && !hasReviewed && !success && (
        <form onSubmit={handleSubmit} className="mb-8 pb-8 border-b border-gray-100">
          <h3 className="font-medium text-gray-900 mb-4">Lascia una recensione</h3>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div className="flex items-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-gray-600">
              {rating > 0 ? `${rating} stella${rating > 1 ? 'e' : ''}` : 'Seleziona'}
            </span>
          </div>

          {/* Comment */}
          <textarea
            value={commento}
            onChange={(e) => setCommento(e.target.value)}
            placeholder="Scrivi un commento (opzionale)"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          />

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Invio...' : 'Invia recensione'}
          </button>
        </form>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-8">
          Grazie per la tua recensione!
        </div>
      )}

      {/* Already Reviewed Message */}
      {isPast && isLoggedIn && hasReviewed && !success && (
        <div className="bg-blue-50 text-blue-600 p-4 rounded-lg mb-8">
          Hai già lasciato una recensione per questo evento.
        </div>
      )}

      {/* Not Past Event */}
      {!isPast && (
        <div className="bg-gray-50 text-gray-600 p-4 rounded-lg mb-8">
          Potrai lasciare una recensione dopo che l&apos;evento sarà terminato.
        </div>
      )}

      {/* Not Logged In */}
      {isPast && !isLoggedIn && (
        <div className="bg-gray-50 text-gray-600 p-4 rounded-lg mb-8">
          <a href="/login" className="text-blue-600 hover:underline">Accedi</a> per lasciare una recensione.
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nessuna recensione ancora. Sii il primo a recensire!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {review.users ? `${review.users.nome} ${review.users.cognome}` : 'Utente'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {format(new Date(review.created_at), "d MMM yyyy", { locale: it })}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.commento && (
                    <p className="text-gray-600">{review.commento}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
