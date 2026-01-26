import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Heart,
  Euro,
  ExternalLink,
  Phone,
  ArrowLeft,
  Share2,
} from 'lucide-react'
import SaveEventButton from './SaveEventButton'
import ReviewSection from './ReviewSection'
import { incrementaViews } from '@/lib/actions/events'

interface PageProps {
  params: Promise<{ id: string }>
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

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch event
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      users!events_creato_da_fkey(nome, cognome)
    `)
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  // Increment views
  await incrementaViews(id)

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      users(nome, cognome)
    `)
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : null

  // Check if user has saved this event
  const { data: { user } } = await supabase.auth.getUser()
  let isSaved = false
  let hasReviewed = false

  if (user) {
    const { data: savedEvent } = await supabase
      .from('saved_events')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', id)
      .single()

    isSaved = !!savedEvent

    const { data: userReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', id)
      .single()

    hasReviewed = !!userReview
  }

  const eventDate = new Date(event.data_inizio)
  const isPast = eventDate < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-100 to-blue-200">
        {event.immagine_url ? (
          <Image
            src={event.immagine_url}
            alt={event.titolo}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-24 h-24 text-blue-300" />
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>

        {/* Share Button */}
        <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors">
          <Share2 className="w-6 h-6 text-gray-700" />
        </button>

        {/* Category Badge */}
        <span className={`absolute bottom-4 left-4 px-4 py-2 rounded-full text-sm font-medium ${categoryColors[event.categoria] || categoryColors.altro}`}>
          {categoryLabels[event.categoria] || event.categoria}
        </span>

        {/* Past Event Overlay */}
        {isPast && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-700 px-6 py-3 rounded-full text-lg font-medium">
              Evento passato
            </span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          {/* Title and Save */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {event.titolo}
              </h1>
              <div className="flex items-center space-x-4">
                {/* Rating */}
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-semibold">
                    {avgRating ? avgRating.toFixed(1) : '-'}
                  </span>
                  <span className="text-gray-400 ml-1">
                    ({reviews?.length || 0} recensioni)
                  </span>
                </div>
              </div>
            </div>

            <SaveEventButton eventId={id} initialSaved={isSaved} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Date */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-semibold text-gray-900">
                  {format(eventDate, "EEEE d MMMM yyyy", { locale: it })}
                </p>
                {event.data_fine && event.data_fine !== event.data_inizio && (
                  <p className="text-sm text-gray-600">
                    fino al {format(new Date(event.data_fine), "d MMMM yyyy", { locale: it })}
                  </p>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Orario</p>
                <p className="font-semibold text-gray-900">
                  {event.ora_inizio.slice(0, 5)}
                  {event.ora_fine && ` - ${event.ora_fine.slice(0, 5)}`}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Luogo</p>
                <p className="font-semibold text-gray-900">{event.luogo}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Euro className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Costo</p>
                <p className="font-semibold text-gray-900">
                  {event.is_gratuito ? (
                    <span className="text-green-600">Gratuito</span>
                  ) : (
                    `€${event.costo}`
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Organizzato da</p>
              <p className="font-semibold text-gray-900">{event.associazione}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Descrizione</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {event.descrizione}
            </p>
          </div>

          {/* Links and Contacts */}
          {(event.link_esterni || event.contatti) && (
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informazioni aggiuntive</h2>
              <div className="space-y-3">
                {event.link_esterni && (
                  <a
                    href={event.link_esterni}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Link esterno</span>
                  </a>
                )}
                {event.contatti && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>{event.contatti}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <ReviewSection
          eventId={id}
          reviews={reviews || []}
          isPast={isPast}
          isLoggedIn={!!user}
          hasReviewed={hasReviewed}
        />
      </div>
    </div>
  )
}
