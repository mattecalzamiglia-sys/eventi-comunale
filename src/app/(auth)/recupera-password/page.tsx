'use client'

import { useState } from 'react'
import Link from 'next/link'
import { recuperaPassword } from '@/lib/actions/auth'
import { Mail, KeyRound } from 'lucide-react'

export default function RecuperaPasswordPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage(null)

    const result = await recuperaPassword(formData)

    if (result.success) {
      setMessage({ type: 'success', text: result.error || 'Email inviata!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Errore' })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Recupera Password</h1>
            <p className="text-gray-600 mt-2">
              Inserisci la tua email e ti invieremo un link per reimpostare la password
            </p>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="mario@esempio.it"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-600 focus:ring-4 focus:ring-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Invio in corso...' : 'Invia email di recupero'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              ← Torna al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
