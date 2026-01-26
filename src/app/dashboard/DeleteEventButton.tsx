'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, X } from 'lucide-react'
import { eliminaEvento } from '@/lib/actions/events'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
}

export default function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await eliminaEvento(eventId)
    if (result.success) {
      setShowConfirm(false)
      router.refresh()
    } else {
      alert(result.error || 'Errore durante l\'eliminazione')
    }
    setIsDeleting(false)
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        title="Elimina"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Conferma eliminazione
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Sei sicuro di voler eliminare l&apos;evento &quot;{eventTitle}&quot;?
              Questa azione non può essere annullata.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
