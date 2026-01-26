import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  LayoutDashboard,
  Plus,
  Calendar,
  Eye,
  Star,
  Heart,
  Edit,
  Trash2,
  BarChart3,
} from 'lucide-react'
import DeleteEventButton from './DeleteEventButton'

export const dynamic = 'force-dynamic'

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

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify role
  const { data: profile } = await supabase
    .from('users')
    .select('role, nome, cognome')
    .eq('id', user.id)
    .single() as { data: { role: string; nome: string; cognome: string } | null; error: unknown }

  if (!profile || (profile.role !== 'comunale' && profile.role !== 'admin')) {
    redirect('/')
  }

  // Fetch user's events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('creato_da', user.id)
    .order('created_at', { ascending: false })

  // Get stats for each event
  const eventsWithStats = []
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

  // Calculate totals
  const totalEvents = eventsWithStats.length
  const totalViews = eventsWithStats.reduce((acc, e) => acc + e.views_count, 0)
  const totalSaves = eventsWithStats.reduce((acc, e) => acc + e.saves_count, 0)
  const totalReviews = eventsWithStats.reduce((acc, e) => acc + e.reviews_count, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bentornato, {profile.nome}!</p>
            </div>
          </div>

          <Link
            href="/dashboard/nuovo-evento"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuovo Evento</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Eventi creati</p>
                <p className="text-3xl font-bold text-gray-900">{totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Visualizzazioni totali</p>
                <p className="text-3xl font-bold text-gray-900">{totalViews}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Salvati nei preferiti</p>
                <p className="text-3xl font-bold text-gray-900">{totalSaves}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recensioni ricevute</p>
                <p className="text-3xl font-bold text-gray-900">{totalReviews}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">I miei eventi</h2>
          </div>

          {eventsWithStats.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessun evento creato
              </h3>
              <p className="text-gray-500 mb-6">
                Inizia creando il tuo primo evento
              </p>
              <Link
                href="/dashboard/nuovo-evento"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Crea evento</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {eventsWithStats.map((event) => {
                    const eventDate = new Date(event.data_inizio)
                    const isPast = eventDate < new Date()

                    return (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <Link
                              href={`/evento/${event.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600"
                            >
                              {event.titolo}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {categoryLabels[event.categoria]} • {event.luogo}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(eventDate, "d MMM yyyy", { locale: it })}
                          <br />
                          <span className="text-gray-400">{event.ora_inizio.slice(0, 5)}</span>
                        </td>
                        <td className="px-6 py-4">
                          {event.is_draft ? (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                              Bozza
                            </span>
                          ) : isPast ? (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Concluso
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Pubblicato
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center" title="Visualizzazioni">
                              <Eye className="w-4 h-4 mr-1" />
                              {event.views_count}
                            </span>
                            <span className="flex items-center" title="Preferiti">
                              <Heart className="w-4 h-4 mr-1" />
                              {event.saves_count}
                            </span>
                            <span className="flex items-center" title="Valutazione">
                              <Star className="w-4 h-4 mr-1 text-yellow-400" />
                              {event.avg_rating ? event.avg_rating.toFixed(1) : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/dashboard/statistiche/${event.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Statistiche"
                            >
                              <BarChart3 className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/dashboard/modifica/${event.id}`}
                              className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                              title="Modifica"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <DeleteEventButton eventId={event.id} eventTitle={event.titolo} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
