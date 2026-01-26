import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Users,
  Calendar,
  Eye,
  Star,
  Heart,
  TrendingUp,
  MessageSquare,
} from 'lucide-react'

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

const categoryColors: Record<string, string> = {
  sport: 'bg-green-500',
  cultura: 'bg-purple-500',
  sociale: 'bg-blue-500',
  musica: 'bg-pink-500',
  arte: 'bg-orange-500',
  educazione: 'bg-cyan-500',
  famiglia: 'bg-yellow-500',
  altro: 'bg-gray-500',
}

export default async function AdminStatistichePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: unknown }

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Fetch all stats
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalCittadini } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'cittadino')

  const { count: totalComunali } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'comunale')

  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('is_draft', false)

  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })

  const { count: totalSaves } = await supabase
    .from('saved_events')
    .select('*', { count: 'exact', head: true })

  // Fetch events for views and category stats
  const { data: allEvents } = await supabase
    .from('events')
    .select('views_count, categoria')
    .eq('is_draft', false) as { data: { views_count: number; categoria: string }[] | null; error: unknown }

  const totalViews = allEvents?.reduce((acc, e) => acc + e.views_count, 0) || 0

  // Category distribution
  const categoryStats: Record<string, number> = {}
  allEvents?.forEach(e => {
    categoryStats[e.categoria] = (categoryStats[e.categoria] || 0) + 1
  })

  const categoryDistribution = Object.entries(categoryStats)
    .map(([categoria, count]) => ({
      categoria,
      count,
      percentage: allEvents && allEvents.length > 0 ? (count / allEvents.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Most popular events
  const { data: popularEvents } = await supabase
    .from('events')
    .select(`
      id,
      titolo,
      views_count,
      categoria
    `)
    .eq('is_draft', false)
    .order('views_count', { ascending: false })
    .limit(5) as { data: { id: string; titolo: string; views_count: number; categoria: string }[] | null; error: unknown }

  // Most saved events
  const { data: savedEventsData } = await supabase
    .from('saved_events')
    .select('event_id') as { data: { event_id: string }[] | null; error: unknown }

  const savesCounts: Record<string, number> = {}
  savedEventsData?.forEach(s => {
    savesCounts[s.event_id] = (savesCounts[s.event_id] || 0) + 1
  })

  const topSavedEventIds = Object.entries(savesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)

  let topSavedEvents: { id: string; titolo: string; categoria: string; saves_count: number }[] = []
  if (topSavedEventIds.length > 0) {
    const { data } = await supabase
      .from('events')
      .select('id, titolo, categoria')
      .in('id', topSavedEventIds) as { data: { id: string; titolo: string; categoria: string }[] | null; error: unknown }

    topSavedEvents = data?.map(e => ({
      ...e,
      saves_count: savesCounts[e.id],
    })).sort((a, b) => b.saves_count - a.saves_count) || []
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/admin"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Statistiche Globali</h1>
              <p className="text-gray-600">Panoramica completa della piattaforma</p>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalUsers || 0}</p>
            <p className="text-xs text-gray-500">Utenti totali</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalEvents || 0}</p>
            <p className="text-xs text-gray-500">Eventi pubblicati</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
            <p className="text-xs text-gray-500">Visualizzazioni</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSaves || 0}</p>
            <p className="text-xs text-gray-500">Eventi salvati</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalReviews || 0}</p>
            <p className="text-xs text-gray-500">Recensioni</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {totalEvents && totalViews ? (totalViews / (totalEvents || 1)).toFixed(0) : 0}
            </p>
            <p className="text-xs text-gray-500">Media views/evento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Eventi per categoria
            </h2>

            {categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                {categoryDistribution.map(({ categoria, count, percentage }) => (
                  <div key={categoria} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${categoryColors[categoria] || categoryColors.altro}`} />
                    <span className="w-24 text-sm text-gray-600">
                      {categoryLabels[categoria] || categoria}
                    </span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${categoryColors[categoria] || categoryColors.altro} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-gray-500 text-right">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun evento</p>
            )}
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Distribuzione utenti
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">2</p>
                <p className="text-sm text-gray-600">Admin</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{totalComunali || 0}</p>
                <p className="text-sm text-gray-600">Comunali</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{totalCittadini || 0}</p>
                <p className="text-sm text-gray-600">Cittadini</p>
              </div>
            </div>

            <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-purple-500 h-full" style={{ width: `${(2 / (totalUsers || 1)) * 100}%` }} />
              <div className="bg-blue-500 h-full" style={{ width: `${((totalComunali || 0) / (totalUsers || 1)) * 100}%` }} />
              <div className="bg-green-500 h-full" style={{ width: `${((totalCittadini || 0) / (totalUsers || 1)) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Viewed Events */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Eye className="w-5 h-5 inline mr-2 text-purple-500" />
              Eventi più visualizzati
            </h2>

            {popularEvents && popularEvents.length > 0 ? (
              <div className="space-y-3">
                {popularEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <div>
                        <Link
                          href={`/evento/${event.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {event.titolo}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {categoryLabels[event.categoria]}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center text-sm text-purple-600 font-medium">
                      <Eye className="w-4 h-4 mr-1" />
                      {event.views_count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun evento</p>
            )}
          </div>

          {/* Most Saved Events */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Heart className="w-5 h-5 inline mr-2 text-red-500" />
              Eventi più salvati
            </h2>

            {topSavedEvents.length > 0 ? (
              <div className="space-y-3">
                {topSavedEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <div>
                        <Link
                          href={`/evento/${event.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {event.titolo}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {categoryLabels[event.categoria]}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center text-sm text-red-600 font-medium">
                      <Heart className="w-4 h-4 mr-1" />
                      {event.saves_count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun evento salvato</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
