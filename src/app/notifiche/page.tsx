import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, Calendar, AlertCircle } from 'lucide-react'
import NotificationList from './NotificationList'

export const dynamic = 'force-dynamic'

export default async function NotifichePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifiche</h1>
              <p className="text-gray-600">
                {unreadCount > 0
                  ? `${unreadCount} ${unreadCount === 1 ? 'nuova notifica' : 'nuove notifiche'}`
                  : 'Tutte le notifiche lette'}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {!notifications || notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nessuna notifica
            </h3>
            <p className="text-gray-500">
              Le tue notifiche appariranno qui
            </p>
          </div>
        ) : (
          <NotificationList initialNotifications={notifications} />
        )}
      </div>
    </div>
  )
}
