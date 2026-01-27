'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadEventImage } from '@/lib/actions/upload'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onClear: () => void
}

export default function ImageUpload({ value, onChange, onClear }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadEventImage(formData)

    if (result.success && result.url) {
      onChange(result.url)
    } else {
      setError(result.error || 'Errore durante il caricamento')
    }

    setIsUploading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  if (value) {
    return (
      <div className="relative">
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={value}
            alt="Immagine evento"
            fill
            className="object-cover"
          />
        </div>
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
          flex flex-col items-center justify-center gap-3 transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-500">Caricamento in corso...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Clicca o trascina un&apos;immagine
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP, GIF - Max 5MB
              </p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Alternativa: URL manuale */}
      <div className="mt-3">
        <details className="text-sm">
          <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
            Oppure inserisci un URL
          </summary>
          <input
            type="url"
            placeholder="https://esempio.it/immagine.jpg"
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value)
              }
            }}
            className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </details>
      </div>
    </div>
  )
}
