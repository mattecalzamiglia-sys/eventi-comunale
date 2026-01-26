import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Bell, Shield } from 'lucide-react'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfiloPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const roleLabels: Record<string, string> = {
    admin: 'Amministratore',
    comunale: 'Utente Comunale',
    cittadino: 'Cittadino',
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    comunale: 'bg-blue-100 text-blue-700',
    cittadino: 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.nome} {profile.cognome}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{profile.email}</span>
              </div>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${roleColors[profile.role]}`}>
                {roleLabels[profile.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <ProfileForm profile={profile} />

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Impostazioni notifiche</h2>
          </div>

          <NotificationSettings profile={profile} />
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Informazioni account</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID utente</span>
              <span className="text-gray-900 font-mono text-xs">{profile.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registrato il</span>
              <span className="text-gray-900">
                {new Date(profile.created_at).toLocaleDateString('it-IT')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stato account</span>
              <span className={`font-medium ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {profile.is_active ? 'Attivo' : 'Disattivato'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import NotificationSettings from './NotificationSettings'
