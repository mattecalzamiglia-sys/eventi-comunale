import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  Users,
  Calendar,
  BarChart3,
  Eye,
  Star,
  Heart,
  TrendingUp,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role, nome')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Fetch stats
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalComunali } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'comunale')

  const { count: totalCittadini } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'cittadino')

  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('is_draft', false)

  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })

  // Fetch total views
  const { data: eventsData } = await supabase
    .from('events')
    .select('views_count')
  const totalViews = eventsData?.reduce((acc, e) => acc + e.views_count, 0) || 0

  // Fetch total saves
  const { count: totalSaves } = await supabase
    .from('saved_events')
    .select('*', { count: 'exact', head: true })

  // Fetch recent events
  const { data: recentEvents } = await supabase
    .from('events')
    .select(`
      id,
      titolo,
      data_inizio,
      views_count,
      users!events_creato_da_fkey(nome, cognome)
    `)
    .eq('is_draft', false)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, nome, cognome, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pannello Admin</h1>
            <p className="text-gray-600">Bentornato, {profile.nome}!</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/utenti"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestione Utenti</h3>
                <p className="text-sm text-gray-500">Crea e gestisci utenti comunali</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/eventi"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestione Eventi</h3>
                <p className="text-sm text-gray-500">Visualizza e modifica tutti gli eventi</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/statistiche"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Statistiche</h3>
                <p className="text-sm text-gray-500">Analisi e report dettagliati</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Utenti totali</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Eventi pubblicati</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Visualizzazioni</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Recensioni</p>
                <p className="text-2xl font-bold text-gray-900">{totalReviews || 0}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Eventi recenti</h2>
              <Link href="/admin/eventi" className="text-sm text-blue-600 hover:text-blue-700">
                Vedi tutti →
              </Link>
            </div>

            {recentEvents && recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{event.titolo}</p>
                      <p className="text-sm text-gray-500">
                        di {event.users?.nome} {event.users?.cognome}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {event.views_count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun evento</p>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Utenti recenti</h2>
              <Link href="/admin/utenti" className="text-sm text-blue-600 hover:text-blue-700">
                Vedi tutti →
              </Link>
            </div>

            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{u.nome} {u.cognome}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : u.role === 'comunale'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun utente</p>
            )}
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione utenti</h2>
          <div className="grid grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  )
}
