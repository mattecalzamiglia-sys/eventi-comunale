'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export interface AuthResult {
  success: boolean
  error?: string
}

// Login utente
export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email e password sono obbligatori' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: 'Credenziali non valide' }
  }

  // Verifica che l'utente sia attivo
  const { data: user } = await supabase.auth.getUser()
  if (user?.user) {
    const { data: profile } = await supabase
      .from('users')
      .select('is_active, role')
      .eq('id', user.user.id)
      .single()

    if (profile && !profile.is_active) {
      await supabase.auth.signOut()
      return { success: false, error: 'Account disattivato. Contatta l\'amministratore.' }
    }

    revalidatePath('/', 'layout')

    // Redirect in base al ruolo
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else if (profile?.role === 'comunale') {
      redirect('/dashboard')
    }
  }

  redirect('/')
}

// Registrazione cittadino
export async function registraCittadino(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const nome = formData.get('nome') as string
  const cognome = formData.get('cognome') as string

  // Validazioni
  if (!email || !password || !nome || !cognome) {
    return { success: false, error: 'Tutti i campi sono obbligatori' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Le password non coincidono' }
  }

  if (password.length < 6) {
    return { success: false, error: 'La password deve essere di almeno 6 caratteri' }
  }

  // Crea utente in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { success: false, error: 'Email già registrata' }
    }
    return { success: false, error: 'Errore durante la registrazione' }
  }

  if (authData.user) {
    // Crea profilo utente
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      nome,
      cognome,
      role: 'cittadino',
    })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return { success: false, error: 'Errore durante la creazione del profilo' }
    }
  }

  return {
    success: true,
    error: 'Registrazione completata! Controlla la tua email per confermare l\'account.'
  }
}

// Logout
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// Recupero password
export async function recuperaPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { success: false, error: 'Email obbligatoria' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return { success: false, error: 'Errore durante l\'invio dell\'email' }
  }

  return {
    success: true,
    error: 'Email di recupero inviata! Controlla la tua casella di posta.'
  }
}

// Reset password (dopo click su link email)
export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { success: false, error: 'Le password non coincidono' }
  }

  if (password.length < 6) {
    return { success: false, error: 'La password deve essere di almeno 6 caratteri' }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { success: false, error: 'Errore durante il reset della password' }
  }

  redirect('/login')
}

// Crea utente comunale (solo admin)
export async function creaUtenteComunale(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  // Verifica che l'utente corrente sia admin
  const { data: currentUser } = await supabase.auth.getUser()
  if (!currentUser?.user) {
    return { success: false, error: 'Non autorizzato' }
  }

  const { data: currentProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.user.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'Solo gli admin possono creare utenti comunali' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nome = formData.get('nome') as string
  const cognome = formData.get('cognome') as string

  if (!email || !password || !nome || !cognome) {
    return { success: false, error: 'Tutti i campi sono obbligatori' }
  }

  // Crea utente in Supabase Auth (bypass email confirmation per comunale)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { success: false, error: 'Email già registrata' }
    }
    return { success: false, error: 'Errore durante la creazione dell\'utente' }
  }

  if (authData.user) {
    // Crea profilo utente comunale
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      nome,
      cognome,
      role: 'comunale',
    })

    if (profileError) {
      console.error('Error creating comunale profile:', profileError)
      return { success: false, error: 'Errore durante la creazione del profilo' }
    }
  }

  revalidatePath('/admin/utenti')
  return { success: true }
}

// Disattiva/Attiva utente comunale (solo admin)
export async function toggleUtenteComunale(userId: string, isActive: boolean): Promise<AuthResult> {
  const supabase = await createClient()

  // Verifica che l'utente corrente sia admin
  const { data: currentUser } = await supabase.auth.getUser()
  if (!currentUser?.user) {
    return { success: false, error: 'Non autorizzato' }
  }

  const { data: currentProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.user.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'Solo gli admin possono modificare utenti comunali' }
  }

  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) {
    return { success: false, error: 'Errore durante l\'aggiornamento' }
  }

  revalidatePath('/admin/utenti')
  return { success: true }
}

// Elimina utente comunale (solo admin)
export async function eliminaUtenteComunale(userId: string): Promise<AuthResult> {
  const supabase = await createClient()

  // Verifica che l'utente corrente sia admin
  const { data: currentUser } = await supabase.auth.getUser()
  if (!currentUser?.user) {
    return { success: false, error: 'Non autorizzato' }
  }

  const { data: currentProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.user.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'Solo gli admin possono eliminare utenti comunali' }
  }

  // Elimina da auth (cascade eliminerà anche il profilo)
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return { success: false, error: 'Errore durante l\'eliminazione' }
  }

  revalidatePath('/admin/utenti')
  return { success: true }
}
