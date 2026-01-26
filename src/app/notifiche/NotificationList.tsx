'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { Bell, Calendar, AlertCircle, Check, Trash2 } from 'lucide-react'
import type { Notification } from '@/types/database'

interface NotificationListProps {
  initialNotifications: Notification[]
}

const notificationIcons = {
  nuovo_evento: Calendar,
  promemoria: Bell,
  sistema: AlertCircle,
}

export default function NotificationList({ initialNotifications }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    )
  }

  const deleteNotification = async (id: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const hasUnread = notifications.some(n => !n.is_read)

  return (
    <div className="space-y-4">
      {/* Actions */}
      {hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Check className="w-4 h-4" />
            <span>Segna tutte come lette</span>
          </button>
        </div>
      )}

      {/* Notification Cards */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {notifications.map((notification, index) => {
          const Icon = notificationIcons[notification.tipo] || Bell

          return (
            <div
              key={notification.id}
              className={`
                p-4 border-b border-gray-100 last:border-0
                ${!notification.is_read ? 'bg-blue-50' : ''}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${notification.tipo === 'nuovo_evento' ? 'bg-green-100' : ''}
                  ${notification.tipo === 'promemoria' ? 'bg-amber-100' : ''}
                  ${notification.tipo === 'sistema' ? 'bg-blue-100' : ''}
                `}>
                  <Icon className={`
                    w-5 h-5
                    ${notification.tipo === 'nuovo_evento' ? 'text-green-600' : ''}
                    ${notification.tipo === 'promemoria' ? 'text-amber-600' : ''}
                    ${notification.tipo === 'sistema' ? 'text-blue-600' : ''}
                  `} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.titolo}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.messaggio}
                      </p>
                      {notification.event_id && (
                        <Link
                          href={`/evento/${notification.event_id}`}
                          className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Vedi evento →
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                          title="Segna come letta"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(notification.created_at), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
