'use client'

import { useState } from 'react'
import EventCard from '@/components/events/EventCard'
import { salvaEvento } from '@/lib/actions/events'
import type { EventWithStats } from '@/types/database'

interface SavedEventsClientProps {
  events: EventWithStats[]
  savedEventIds: string[]
}

export default function SavedEventsClient({ events, savedEventIds: initialIds }: SavedEventsClientProps) {
  const [savedEventIds, setSavedEventIds] = useState<string[]>(initialIds)
  const [visibleEvents, setVisibleEvents] = useState<EventWithStats[]>(events)

  const handleToggleSave = async (eventId: string) => {
    const result = await salvaEvento(eventId)
    if (result.success && result.data) {
      const { saved } = result.data as { saved: boolean }
      if (!saved) {
        // Remove from list immediately
        setSavedEventIds(prev => prev.filter(id => id !== eventId))
        setVisibleEvents(prev => prev.filter(e => e.id !== eventId))
      }
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {visibleEvents.map(event => (
        <EventCard
          key={event.id}
          event={event}
          isSaved={savedEventIds.includes(event.id)}
          onToggleSave={handleToggleSave}
        />
      ))}
    </div>
  )
}
