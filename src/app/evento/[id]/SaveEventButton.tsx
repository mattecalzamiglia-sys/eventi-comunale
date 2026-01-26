'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { salvaEvento } from '@/lib/actions/events'

interface SaveEventButtonProps {
  eventId: string
  initialSaved: boolean
}

export default function SaveEventButton({ eventId, initialSaved }: SaveEventButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleSave = async () => {
    setIsLoading(true)
    const result = await salvaEvento(eventId)
    if (result.success && result.data) {
      const { saved } = result.data as { saved: boolean }
      setIsSaved(saved)
    }
    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isSaved
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
      <span>{isSaved ? 'Salvato' : 'Salva'}</span>
    </button>
  )
}
