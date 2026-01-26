import { createClient } from '@/lib/supabase/server'
import EventFiltersWrapper from '@/components/events/EventFiltersWrapper'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { EventWithStats, EventCategory } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch eventi pubblicati
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      users!events_creato_da_fkey(nome, cognome)
    `)
    .eq('is_draft', false)
    .gte('data_inizio', new Date().toISOString().split('T')[0])
    .order('data_inizio', { ascending: true })

  // Fetch statistiche per ogni evento
  const eventsWithStats: EventWithStats[] = []

  if (events) {
    for (const event of events) {
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
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
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

  // Get unique values for filters
  const categories = [...new Set(events?.map(e => e.categoria) || [])] as EventCategory[]
  const locations = [...new Set(events?.map(e => e.luogo) || [])]
  const associations = [...new Set(events?.map(e => e.associazione) || [])]

  // Get user's saved events
  const { data: { user } } = await supabase.auth.getUser()
  let savedEventIds: string[] = []

  if (user) {
    const { data: savedEvents } = await supabase
      .from('saved_events')
      .select('event_id')
      .eq('user_id', user.id)

    savedEventIds = savedEvents?.map(se => se.event_id) || []
  }

  // Stats for hero section
  const totalEvents = events?.length || 0
  const totalLocations = locations.length
  const totalAssociations = associations.length

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scopri gli Eventi del Comune
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Trova tutti gli eventi organizzati dal comune e dalle associazioni locali.
              Sport, cultura, musica e molto altro ti aspettano!
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">{totalEvents}</div>
                  <div className="text-blue-200 text-sm">Eventi in programma</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">{totalLocations}</div>
                  <div className="text-blue-200 text-sm">Luoghi</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">{totalAssociations}</div>
                  <div className="text-blue-200 text-sm">Associazioni</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EventFiltersWrapper
            events={eventsWithStats}
            savedEventIds={savedEventIds}
            categories={categories}
            locations={locations}
            associations={associations}
          />
        </div>
      </section>
    </div>
  )
}
