'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Euro,
  Link as LinkIcon,
  Phone,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  Eye,
} from 'lucide-react'
import { creaEvento, modificaEvento } from '@/lib/actions/events'
import ImageUpload from '@/components/ImageUpload'
import type { Event, EventCategory } from '@/types/database'

interface EventFormProps {
  event?: Event
}

const categories: { value: EventCategory; label: string }[] = [
  { value: 'sport', label: 'Sport' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'sociale', label: 'Sociale' },
  { value: 'musica', label: 'Musica' },
  { value: 'arte', label: 'Arte' },
  { value: 'educazione', label: 'Educazione' },
  { value: 'famiglia', label: 'Famiglia' },
  { value: 'altro', label: 'Altro' },
]

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!event

  const [formData, setFormData] = useState({
    titolo: event?.titolo || '',
    descrizione: event?.descrizione || '',
    data_inizio: event?.data_inizio || '',
    ora_inizio: event?.ora_inizio?.slice(0, 5) || '',
    data_fine: event?.data_fine || '',
    ora_fine: event?.ora_fine?.slice(0, 5) || '',
    luogo: event?.luogo || '',
    categoria: event?.categoria || 'altro' as EventCategory,
    associazione: event?.associazione || '',
    is_gratuito: event?.is_gratuito ?? true,
    costo: event?.costo?.toString() || '',
    link_esterni: event?.link_esterni || '',
    contatti: event?.contatti || '',
    immagine_url: event?.immagine_url || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsSubmitting(true)
    setError(null)

    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        form.append(key, value.toString())
      }
    })
    form.append('is_draft', isDraft.toString())

    let result

    if (isEditing && event) {
      result = await modificaEvento(event.id, form)
    } else {
      result = await creaEvento(form)
    }

    if (result.success) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(result.error || 'Si è verificato un errore')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-6">
        {/* Titolo */}
        <div>
          <label htmlFor="titolo" className="block text-sm font-medium text-gray-700 mb-2">
            Titolo evento *
          </label>
          <input
            id="titolo"
            name="titolo"
            type="text"
            required
            value={formData.titolo}
            onChange={handleChange}
            placeholder="Es. Festa dello Sport 2026"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Descrizione */}
        <div>
          <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700 mb-2">
            Descrizione *
          </label>
          <textarea
            id="descrizione"
            name="descrizione"
            required
            rows={5}
            value={formData.descrizione}
            onChange={handleChange}
            placeholder="Descrivi l'evento in dettaglio..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Data e Ora Inizio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="data_inizio" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data inizio *
            </label>
            <input
              id="data_inizio"
              name="data_inizio"
              type="date"
              required
              value={formData.data_inizio}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="ora_inizio" className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Ora inizio *
            </label>
            <input
              id="ora_inizio"
              name="ora_inizio"
              type="time"
              required
              value={formData.ora_inizio}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data e Ora Fine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="data_fine" className="block text-sm font-medium text-gray-700 mb-2">
              Data fine (opzionale)
            </label>
            <input
              id="data_fine"
              name="data_fine"
              type="date"
              value={formData.data_fine}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="ora_fine" className="block text-sm font-medium text-gray-700 mb-2">
              Ora fine (opzionale)
            </label>
            <input
              id="ora_fine"
              name="ora_fine"
              type="time"
              value={formData.ora_fine}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Luogo */}
        <div>
          <label htmlFor="luogo" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Luogo *
          </label>
          <input
            id="luogo"
            name="luogo"
            type="text"
            required
            value={formData.luogo}
            onChange={handleChange}
            placeholder="Es. Piazza Centrale, Via Roma 1"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Categoria e Associazione */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              id="categoria"
              name="categoria"
              required
              value={formData.categoria}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="associazione" className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Associazione organizzatrice *
            </label>
            <input
              id="associazione"
              name="associazione"
              type="text"
              required
              value={formData.associazione}
              onChange={handleChange}
              placeholder="Es. Pro Loco, ASD Sport Club"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Costo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Euro className="w-4 h-4 inline mr-1" />
            Costo
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="is_gratuito"
                checked={formData.is_gratuito}
                onChange={() => setFormData(prev => ({ ...prev, is_gratuito: true, costo: '' }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">Gratuito</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="is_gratuito"
                checked={!formData.is_gratuito}
                onChange={() => setFormData(prev => ({ ...prev, is_gratuito: false }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2">A pagamento</span>
            </label>
          </div>
          {!formData.is_gratuito && (
            <input
              type="number"
              name="costo"
              step="0.01"
              min="0"
              value={formData.costo}
              onChange={handleChange}
              placeholder="Inserisci il costo in €"
              className="mt-3 w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>

        {/* Link esterni */}
        <div>
          <label htmlFor="link_esterni" className="block text-sm font-medium text-gray-700 mb-2">
            <LinkIcon className="w-4 h-4 inline mr-1" />
            Link esterno (opzionale)
          </label>
          <input
            id="link_esterni"
            name="link_esterni"
            type="url"
            value={formData.link_esterni}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Contatti */}
        <div>
          <label htmlFor="contatti" className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Contatti (opzionale)
          </label>
          <input
            id="contatti"
            name="contatti"
            type="text"
            value={formData.contatti}
            onChange={handleChange}
            placeholder="Es. Tel. 0123 456789, email@esempio.it"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Immagine */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            Immagine evento (opzionale)
          </label>
          <ImageUpload
            value={formData.immagine_url}
            onChange={(url) => setFormData(prev => ({ ...prev, immagine_url: url }))}
            onClear={() => setFormData(prev => ({ ...prev, immagine_url: '' }))}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Annulla</span>
          </Link>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex items-center justify-center space-x-2 px-4 py-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>Salva come bozza</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Eye className="w-5 h-5" />
            <span>{isSubmitting ? 'Pubblicazione...' : (isEditing ? 'Aggiorna e pubblica' : 'Pubblica evento')}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
