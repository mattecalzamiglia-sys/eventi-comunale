import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EventForm from '../../EventForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ModificaEventoPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: unknown }

  if (!profile || (profile.role !== 'comunale' && profile.role !== 'admin')) {
    redirect('/')
  }

  // Fetch event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  // Check ownership (unless admin)
  if (profile.role !== 'admin' && event.creato_da !== user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Modifica Evento</h1>
          <p className="text-gray-600">Aggiorna i dettagli dell&apos;evento</p>
        </div>

        <EventForm event={event} />
      </div>
    </div>
  )
}
