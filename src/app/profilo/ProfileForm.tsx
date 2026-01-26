'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from 'lucide-react'
import type { User as UserType } from '@/types/database'

interface ProfileFormProps {
  profile: UserType
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [nome, setNome] = useState(profile.nome)
  const [cognome, setCognome] = useState(profile.cognome)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { error } = await supabase
      .from('users')
      .update({ nome, cognome })
      .eq('id', profile.id)

    if (error) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento del profilo' })
    } else {
      setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' })
    }

    setIsLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Informazioni personali</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`p-4 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="cognome" className="block text-sm font-medium text-gray-700 mb-2">
              Cognome
            </label>
            <input
              id="cognome"
              type="text"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">L&apos;email non può essere modificata</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Salvataggio...' : 'Salva modifiche'}
        </button>
      </form>
    </div>
  )
}
