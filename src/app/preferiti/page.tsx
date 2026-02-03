import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventCard from '@/components/events/EventCard'
import { Heart } from 'lucide-react'
import type { EventWithStats } from '@/types/database'
import SavedEventsClient from './SavedEventsClient'

export const dynamic = 'force-dynamic'

export default async function PreferitiPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch saved events
  const { data: savedEvents } = await supabase
    .from('saved_events')
    .select(`
      event_id,
      events(
        *,
        users!events_creato_da_fkey(nome, cognome)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Process events with stats
  const eventsWithStats: EventWithStats[] = []

  if (savedEvents) {
    for (const saved of savedEvents) {
      const event = saved.events as any
      if (!event) continue

      // Get reviews stats
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('event_id', event.id)

      // Get saves count
      const { count: savesCount } = await supabase
        .from('saved_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)

      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviews.length
        : null

      eventsWithStats.push({
        ...event,
        avg_rating: avgRating,
        reviews_count: reviews?.length || 0,
        saves_count: savesCount || 0,
        creator: event.users,
      })
    }
  }

  const savedEventIds = eventsWithStats.map(e => e.id)

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">I miei preferiti</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {eventsWithStats.length} {eventsWithStats.length === 1 ? 'evento salvato' : 'eventi salvati'}
            </p>
          </div>
        </div>

        {/* Events */}
        {eventsWithStats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Nessun evento salvato
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              Salva gli eventi che ti interessano per trovarli facilmente qui
            </p>
            <a
              href="/"
              className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Scopri gli eventi
            </a>
          </div>
        ) : (
          <SavedEventsClient
            events={eventsWithStats}
            savedEventIds={savedEventIds}
          />
        )}
      </div>
    </div>
  )
}
