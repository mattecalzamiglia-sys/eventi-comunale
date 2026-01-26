'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import type { EventWithStats } from '@/types/database'

interface CalendarViewProps {
  events: EventWithStats[]
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

export default function CalendarView({ events }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Get events grouped by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EventWithStats[]> = {}
    events.forEach(event => {
      const dateKey = event.data_inizio
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = startDate
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentMonth])

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return eventsByDate[dateKey] || []
  }, [selectedDate, eventsByDate])

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: it })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Oggi
            </button>
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[dateKey] || []
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`
                  min-h-[80px] p-2 text-left rounded-lg transition-colors
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isToday ? 'bg-blue-50' : ''}
                  hover:bg-gray-100
                `}
              >
                <span className={`
                  inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                  ${isToday ? 'bg-blue-600 text-white font-bold' : ''}
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Event Dots */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${categoryColors[event.categoria] || categoryColors.altro}`}
                      title={event.titolo}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-gray-500">+{dayEvents.length - 3}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Legenda categorie:</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-xs text-gray-600 capitalize">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Date Events */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {selectedDate ? (
            format(selectedDate, "d MMMM yyyy", { locale: it })
          ) : (
            'Seleziona una data'
          )}
        </h3>

        {!selectedDate ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Clicca su una data per vedere gli eventi
            </p>
          </div>
        ) : selectedDateEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Nessun evento in questa data
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDateEvents.map(event => (
              <Link
                key={event.id}
                href={`/evento/${event.id}`}
                className="block p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${categoryColors[event.categoria]}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {event.titolo}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {event.ora_inizio.slice(0, 5)} • {event.luogo}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {event.associazione}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
