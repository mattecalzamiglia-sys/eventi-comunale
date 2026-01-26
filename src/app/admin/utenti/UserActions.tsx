'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Power, Trash2, X } from 'lucide-react'
import { toggleUtenteComunale, eliminaUtenteComunale } from '@/lib/actions/auth'
import type { User } from '@/types/database'

interface UserActionsProps {
  user: User
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleActive = async () => {
    setIsLoading(true)
    await toggleUtenteComunale(user.id, !user.is_active)
    router.refresh()
    setIsLoading(false)
    setShowMenu(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    await eliminaUtenteComunale(user.id)
    router.refresh()
    setIsLoading(false)
    setShowDeleteConfirm(false)
  }

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
            <button
              onClick={handleToggleActive}
              disabled={isLoading}
              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Power className="w-4 h-4" />
              <span>{user.is_active ? 'Disattiva' : 'Attiva'} account</span>
            </button>
            {user.role === 'comunale' && (
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowDeleteConfirm(true)
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Elimina account</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Conferma eliminazione
              </h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Sei sicuro di voler eliminare l&apos;account di <strong>{user.nome} {user.cognome}</strong>?
              Questa azione eliminerà anche tutti gli eventi creati da questo utente.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
