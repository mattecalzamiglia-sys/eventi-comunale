'use server'

import { createClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'event-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadEventImage(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient()

  // Verifica autenticazione
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Devi essere autenticato per caricare immagini' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'Nessun file selezionato' }
  }

  // Validazione tipo file
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'Tipo file non supportato. Usa JPG, PNG, WebP o GIF' }
  }

  // Validazione dimensione
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'Il file è troppo grande. Massimo 5MB' }
  }

  // Genera nome file unico
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Converti File in ArrayBuffer per l'upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  // Upload su Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { success: false, error: 'Errore durante il caricamento dell\'immagine' }
  }

  // Ottieni URL pubblico
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)

  return {
    success: true,
    url: urlData.publicUrl,
  }
}

export async function deleteEventImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Verifica autenticazione
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non autorizzato' }
  }

  // Estrai il path dal URL
  const urlParts = imageUrl.split(`${BUCKET_NAME}/`)
  if (urlParts.length < 2) {
    return { success: false, error: 'URL immagine non valido' }
  }

  const filePath = urlParts[1]

  // Verifica che il file appartenga all'utente
  if (!filePath.startsWith(user.id)) {
    return { success: false, error: 'Non puoi eliminare questa immagine' }
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Errore durante l\'eliminazione dell\'immagine' }
  }

  return { success: true }
}
