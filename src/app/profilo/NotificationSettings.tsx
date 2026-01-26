'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, EventCategory } from '@/types/database'

interface NotificationSettingsProps {
  profile: User
}

const categoryLabels: Record<EventCategory, string> = {
  sport: 'Sport',
  cultura: 'Cultura',
  sociale: 'Sociale',
  musica: 'Musica',
  arte: 'Arte',
  educazione: 'Educazione',
  famiglia: 'Famiglia',
  altro: 'Altro',
}

const allCategories: EventCategory[] = [
  'sport', 'cultura', 'sociale', 'musica', 'arte', 'educazione', 'famiglia', 'altro'
]

export default function NotificationSettings({ profile }: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(profile.email_notifications)
  const [appNotifications, setAppNotifications] = useState(profile.app_notifications)
  const [preferredCategories, setPreferredCategories] = useState<EventCategory[]>(
    profile.preferred_categories || []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const toggleCategory = (category: EventCategory) => {
    setPreferredCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { error } = await supabase
      .from('users')
      .update({
        email_notifications: emailNotifications,
        app_notifications: appNotifications,
        preferred_categories: preferredCategories,
      })
      .eq('id', profile.id)

    if (error) {
      setMessage({ type: 'error', text: 'Errore durante il salvataggio' })
    } else {
      setMessage({ type: 'success', text: 'Impostazioni salvate!' })
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 text-green-600'
            : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Notification Channels */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Canali di notifica</h3>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <div>
            <p className="font-medium text-gray-900">Notifiche email</p>
            <p className="text-sm text-gray-500">Ricevi notifiche via email</p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
          <div>
            <p className="font-medium text-gray-900">Notifiche in-app</p>
            <p className="text-sm text-gray-500">Ricevi notifiche nell&apos;applicazione</p>
          </div>
          <input
            type="checkbox"
            checked={appNotifications}
            onChange={(e) => setAppNotifications(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
        </label>
      </div>

      {/* Preferred Categories */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">
          Categorie di interesse
          <span className="text-gray-400 font-normal ml-2">
            (riceverai notifiche per queste categorie)
          </span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                preferredCategories.includes(category)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {preferredCategories.length === 0 && (
          <p className="text-sm text-gray-500">
            Nessuna categoria selezionata - riceverai notifiche per tutti gli eventi
          </p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Salvataggio...' : 'Salva impostazioni'}
      </button>
    </div>
  )
}
