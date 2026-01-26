import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventForm from '../EventForm'

export const dynamic = 'force-dynamic'

export default async function NuovoEventoPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nuovo Evento</h1>
          <p className="text-gray-600">Compila il form per creare un nuovo evento</p>
        </div>

        <EventForm />
      </div>
    </div>
  )
}
