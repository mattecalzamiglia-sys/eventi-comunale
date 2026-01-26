import { createClient } from '@/lib/supabase/server'
import CalendarView from './CalendarView'
import type { EventWithStats } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const supabase = await createClient()

  // Fetch all published events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_draft', false)
    .order('data_inizio', { ascending: true })

  // Fetch stats for events
  const eventsWithStats: EventWithStats[] = []

  if (events) {
    for (const event of events) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('event_id', event.id)

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
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Calendario Eventi</h1>
        <CalendarView events={eventsWithStats} />
      </div>
    </div>
  )
}
