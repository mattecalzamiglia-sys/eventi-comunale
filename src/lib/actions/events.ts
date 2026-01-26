'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EventCategory } from '@/types/database'

export interface ActionResult {
  success: boolean
  error?: string
  data?: unknown
}

// Crea nuovo evento
export async function creaEvento(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non autorizzato' }
  }

  // Verifica ruolo
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'comunale' && profile?.role !== 'admin') {
    return { success: false, error: 'Solo gli utenti comunali possono creare eventi' }
  }

  const titolo = formData.get('titolo') as string
  const descrizione = formData.get('descrizione') as string
  const data_inizio = formData.get('data_inizio') as string
  const ora_inizio = formData.get('ora_inizio') as string
  const data_fine = formData.get('data_fine') as string | null
  const ora_fine = formData.get('ora_fine') as string | null
  const luogo = formData.get('luogo') as string
  const categoria = formData.get('categoria') as EventCategory
  const associazione = formData.get('associazione') as string
  const costo = formData.get('costo') as string
  const is_gratuito = formData.get('is_gratuito') === 'true'
  const link_esterni = formData.get('link_esterni') as string | null
  const contatti = formData.get('contatti') as string | null
  const is_draft = formData.get('is_draft') === 'true'
  const immagine_url = formData.get('immagine_url') as string | null

  if (!titolo || !descrizione || !data_inizio || !ora_inizio || !luogo || !categoria || !associazione) {
    return { success: false, error: 'Tutti i campi obbligatori devono essere compilati' }
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      titolo,
      descrizione,
      data_inizio,
      ora_inizio,
      data_fine: data_fine || null,
      ora_fine: ora_fine || null,
      luogo,
      categoria,
      associazione,
      creato_da: user.id,
      immagine_url: immagine_url || null,
      costo: costo ? parseFloat(costo) : null,
      is_gratuito,
      link_esterni: link_esterni || null,
      contatti: contatti || null,
      is_draft,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    return { success: false, error: 'Errore durante la creazione dell\'evento' }
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  return { success: true, data: event }
}

// Modifica evento
export async function modificaEvento(eventId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non autorizzato' }
  }

  // Verifica ruolo e proprietà
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: existingEvent } = await supabase
    .from('events')
    .select('creato_da')
    .eq('id', eventId)
    .single()

  if (!existingEvent) {
    return { success: false, error: 'Evento non trovato' }
  }

  // Solo admin o proprietario possono modificare
  if (profile?.role !== 'admin' && existingEvent.creato_da !== user.id) {
    return { success: false, error: 'Non hai i permessi per modificare questo evento' }
  }

  const updateData: Record<string, unknown> = {}

  const fields = [
    'titolo', 'descrizione', 'data_inizio', 'ora_inizio', 'data_fine',
    'ora_fine', 'luogo', 'categoria', 'associazione', 'link_esterni',
    'contatti', 'immagine_url'
  ]

  fields.forEach(field => {
    const value = formData.get(field)
    if (value !== null) {
      updateData[field] = value === '' ? null : value
    }
  })

  // Handle special fields
  const costo = formData.get('costo')
  if (costo !== null) {
    updateData.costo = costo ? parseFloat(costo as string) : null
  }

  const is_gratuito = formData.get('is_gratuito')
  if (is_gratuito !== null) {
    updateData.is_gratuito = is_gratuito === 'true'
  }

  const is_draft = formData.get('is_draft')
  if (is_draft !== null) {
    updateData.is_draft = is_draft === 'true'
  }

  const { error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', eventId)

  if (error) {
    console.error('Error updating event:', error)
    return { success: false, error: 'Errore durante la modifica dell\'evento' }
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath(`/evento/${eventId}`)
  return { success: true }
}

// Elimina evento
export async function eliminaEvento(eventId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non autorizzato' }
  }

  // Verifica ruolo e proprietà
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: existingEvent } = await supabase
    .from('events')
    .select('creato_da')
    .eq('id', eventId)
    .single()

  if (!existingEvent) {
    return { success: false, error: 'Evento non trovato' }
  }

  // Solo admin o proprietario possono eliminare
  if (profile?.role !== 'admin' && existingEvent.creato_da !== user.id) {
    return { success: false, error: 'Non hai i permessi per eliminare questo evento' }
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Error deleting event:', error)
    return { success: false, error: 'Errore durante l\'eliminazione dell\'evento' }
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  return { success: true }
}

// Salva evento nei preferiti
export async function salvaEvento(eventId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Devi effettuare il login per salvare eventi' }
  }

  // Controlla se già salvato
  const { data: existing } = await supabase
    .from('saved_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .single()

  if (existing) {
    // Rimuovi dai preferiti
    const { error } = await supabase
      .from('saved_events')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: 'Errore durante la rimozione dai preferiti' }
    }

    revalidatePath('/preferiti')
    return { success: true, data: { saved: false } }
  } else {
    // Aggiungi ai preferiti
    const { error } = await supabase
      .from('saved_events')
      .insert({
        user_id: user.id,
        event_id: eventId,
      })

    if (error) {
      return { success: false, error: 'Errore durante il salvataggio nei preferiti' }
    }

    revalidatePath('/preferiti')
    return { success: true, data: { saved: true } }
  }
}

// Aggiungi recensione
export async function aggiungiRecensione(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Devi effettuare il login per lasciare una recensione' }
  }

  const event_id = formData.get('event_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const commento = formData.get('commento') as string | null

  if (!event_id || !rating || rating < 1 || rating > 5) {
    return { success: false, error: 'Dati non validi' }
  }

  // Verifica che l'evento sia passato
  const { data: event } = await supabase
    .from('events')
    .select('data_inizio')
    .eq('id', event_id)
    .single()

  if (!event) {
    return { success: false, error: 'Evento non trovato' }
  }

  if (new Date(event.data_inizio) > new Date()) {
    return { success: false, error: 'Puoi lasciare una recensione solo dopo che l\'evento è terminato' }
  }

  // Controlla se ha già recensito
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', event_id)
    .single()

  if (existing) {
    return { success: false, error: 'Hai già lasciato una recensione per questo evento' }
  }

  const { error } = await supabase
    .from('reviews')
    .insert({
      event_id,
      user_id: user.id,
      rating,
      commento: commento || null,
    })

  if (error) {
    console.error('Error creating review:', error)
    return { success: false, error: 'Errore durante l\'invio della recensione' }
  }

  revalidatePath(`/evento/${event_id}`)
  return { success: true }
}

// Incrementa visualizzazioni evento
export async function incrementaViews(eventId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('increment_event_views', { event_uuid: eventId })
}
