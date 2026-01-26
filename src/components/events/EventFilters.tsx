'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import type { EventCategory } from '@/types/database'

interface EventFiltersProps {
  onFilterChange: (filters: EventFilters) => void
  categories: EventCategory[]
  locations: string[]
  associations: string[]
}

export interface EventFilters {
  search: string
  categoria: EventCategory | ''
  luogo: string
  associazione: string
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  dateFrom?: string
  dateTo?: string
  isFree: boolean | null
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

const dateRangeLabels = {
  all: 'Tutte le date',
  today: 'Oggi',
  week: 'Questa settimana',
  month: 'Questo mese',
  custom: 'Personalizzato',
}

export default function EventFilters({
  onFilterChange,
  categories,
  locations,
  associations,
}: EventFiltersProps) {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    categoria: '',
    luogo: '',
    associazione: '',
    dateRange: 'all',
    isFree: null,
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof EventFilters, value: string | boolean | null) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: EventFilters = {
      search: '',
      categoria: '',
      luogo: '',
      associazione: '',
      dateRange: 'all',
      isFree: null,
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = filters.categoria || filters.luogo || filters.associazione || filters.dateRange !== 'all' || filters.isFree !== null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cerca eventi..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Date Range */}
        <select
          value={filters.dateRange}
          onChange={(e) => updateFilter('dateRange', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(dateRangeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Category */}
        <select
          value={filters.categoria}
          onChange={(e) => updateFilter('categoria', e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tutte le categorie</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{categoryLabels[cat]}</option>
          ))}
        </select>

        {/* Free/Paid Toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => updateFilter('isFree', filters.isFree === null ? true : filters.isFree === true ? false : null)}
            className={`px-4 py-2 text-sm transition-colors ${
              filters.isFree === true
                ? 'bg-green-500 text-white'
                : filters.isFree === false
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filters.isFree === null ? 'Tutti' : filters.isFree ? 'Gratuiti' : 'A pagamento'}
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Altri filtri
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Rimuovi filtri
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Luogo
            </label>
            <select
              value={filters.luogo}
              onChange={(e) => updateFilter('luogo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tutti i luoghi</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Association */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associazione
            </label>
            <select
              value={filters.associazione}
              onChange={(e) => updateFilter('associazione', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tutte le associazioni</option>
              {associations.map((ass) => (
                <option key={ass} value={ass}>{ass}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Da
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  A
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
