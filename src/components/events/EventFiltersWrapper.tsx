'use client'

import { useState, useMemo } from 'react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import EventCard from './EventCard'
import EventFilters, { type EventFilters as Filters } from './EventFilters'
import { salvaEvento } from '@/lib/actions/events'
import { Calendar } from 'lucide-react'
import type { EventWithStats, EventCategory } from '@/types/database'

interface EventFiltersWrapperProps {
  events: EventWithStats[]
  savedEventIds: string[]
  categories: EventCategory[]
  locations: string[]
  associations: string[]
}

export default function EventFiltersWrapper({
  events,
  savedEventIds: initialSavedIds,
  categories,
  locations,
  associations,
}: EventFiltersWrapperProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categoria: '',
    luogo: '',
    associazione: '',
    dateRange: 'all',
    isFree: null,
  })
  const [savedEventIds, setSavedEventIds] = useState<string[]>(initialSavedIds)

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          event.titolo.toLowerCase().includes(searchLower) ||
          event.descrizione.toLowerCase().includes(searchLower) ||
          event.luogo.toLowerCase().includes(searchLower) ||
          event.associazione.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.categoria && event.categoria !== filters.categoria) {
        return false
      }

      // Location filter
      if (filters.luogo && event.luogo !== filters.luogo) {
        return false
      }

      // Association filter
      if (filters.associazione && event.associazione !== filters.associazione) {
        return false
      }

      // Free/Paid filter
      if (filters.isFree !== null && event.is_gratuito !== filters.isFree) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const eventDate = parseISO(event.data_inizio)
        const today = new Date()

        let interval: { start: Date; end: Date } | null = null

        switch (filters.dateRange) {
          case 'today':
            interval = { start: startOfDay(today), end: endOfDay(today) }
            break
          case 'week':
            interval = { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) }
            break
          case 'month':
            interval = { start: startOfMonth(today), end: endOfMonth(today) }
            break
          case 'custom':
            if (filters.dateFrom && filters.dateTo) {
              interval = {
                start: parseISO(filters.dateFrom),
                end: parseISO(filters.dateTo),
              }
            }
            break
        }

        if (interval && !isWithinInterval(eventDate, interval)) {
          return false
        }
      }

      return true
    })
  }, [events, filters])

  const handleToggleSave = async (eventId: string) => {
    const result = await salvaEvento(eventId)
    if (result.success && result.data) {
      const { saved } = result.data as { saved: boolean }
      if (saved) {
        setSavedEventIds(prev => [...prev, eventId])
      } else {
        setSavedEventIds(prev => prev.filter(id => id !== eventId))
      }
    }
  }

  return (
    <div>
      <EventFilters
        onFilterChange={setFilters}
        categories={categories}
        locations={locations}
        associations={associations}
      />

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nessun evento trovato
          </h3>
          <p className="text-gray-500">
            Prova a modificare i filtri di ricerca
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'evento trovato' : 'eventi trovati'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isSaved={savedEventIds.includes(event.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
