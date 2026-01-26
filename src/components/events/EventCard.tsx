'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  Calendar,
  MapPin,
  Star,
  Heart,
  Users,
  Euro,
  Clock,
} from 'lucide-react'
import type { EventWithStats } from '@/types/database'

interface EventCardProps {
  event: EventWithStats
  isSaved?: boolean
  onToggleSave?: (eventId: string) => void
  showStats?: boolean
}

const categoryColors: Record<string, string> = {
  sport: 'bg-green-100 text-green-700',
  cultura: 'bg-purple-100 text-purple-700',
  sociale: 'bg-blue-100 text-blue-700',
  musica: 'bg-pink-100 text-pink-700',
  arte: 'bg-orange-100 text-orange-700',
  educazione: 'bg-cyan-100 text-cyan-700',
  famiglia: 'bg-yellow-100 text-yellow-700',
  altro: 'bg-gray-100 text-gray-700',
}

const categoryLabels: Record<string, string> = {
  sport: 'Sport',
  cultura: 'Cultura',
  sociale: 'Sociale',
  musica: 'Musica',
  arte: 'Arte',
  educazione: 'Educazione',
  famiglia: 'Famiglia',
  altro: 'Altro',
}

export default function EventCard({
  event,
  isSaved = false,
  onToggleSave,
  showStats = false,
}: EventCardProps) {
  const eventDate = new Date(event.data_inizio)
  const isPast = eventDate < new Date()

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${isPast ? 'opacity-75' : ''}`}>
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
        {event.immagine_url ? (
          <Image
            src={event.immagine_url}
            alt={event.titolo}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-blue-300" />
          </div>
        )}

        {/* Category Badge */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[event.categoria] || categoryColors.altro}`}>
          {categoryLabels[event.categoria] || event.categoria}
        </span>

        {/* Save Button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleSave(event.id)
            }}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Free/Paid Badge */}
        <span className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
          event.is_gratuito
            ? 'bg-green-500 text-white'
            : 'bg-amber-500 text-white'
        }`}>
          {event.is_gratuito ? 'Gratuito' : `€${event.costo}`}
        </span>

        {/* Past Event Overlay */}
        {isPast && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white/90 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
              Evento passato
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <Link href={`/evento/${event.id}`}>
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
            {event.titolo}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {format(eventDate, "EEEE d MMMM yyyy", { locale: it })}
            </span>
          </div>

          <div className="flex items-center text-gray-600 text-sm mb-2">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{event.ora_inizio.slice(0, 5)}</span>
            {event.ora_fine && (
              <span> - {event.ora_fine.slice(0, 5)}</span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{event.luogo}</span>
          </div>

          {/* Organizer */}
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{event.associazione}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {/* Rating */}
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-medium">
                  {event.avg_rating ? event.avg_rating.toFixed(1) : '-'}
                </span>
                <span className="text-gray-400 ml-1">
                  ({event.reviews_count || 0})
                </span>
              </div>

              {/* Saves */}
              <div className="flex items-center text-sm text-gray-500">
                <Heart className="w-4 h-4 mr-1" />
                <span>{event.saves_count || 0}</span>
              </div>
            </div>

            {showStats && (
              <div className="text-xs text-gray-400">
                {event.views_count} visualizzazioni
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
