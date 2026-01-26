import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  ArrowLeft,
  Users,
  UserPlus,
  Shield,
  Building,
  User,
} from 'lucide-react'
import CreateUserForm from './CreateUserForm'
import UserActions from './UserActions'

export const dynamic = 'force-dynamic'

export default async function AdminUtentiPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Fetch all users
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  const roleIcons: Record<string, typeof Shield> = {
    admin: Shield,
    comunale: Building,
    cittadino: User,
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    comunale: 'bg-blue-100 text-blue-700',
    cittadino: 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/admin"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Utenti</h1>
              <p className="text-gray-600">{users?.length || 0} utenti registrati</p>
            </div>
          </div>
        </div>

        {/* Create User Form */}
        <CreateUserForm />

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Elenco utenti</h2>
          </div>

          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ruolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registrato
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const RoleIcon = roleIcons[u.role] || User

                    return (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <RoleIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {u.nome} {u.cognome}
                              </p>
                              <p className="text-sm text-gray-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${roleColors[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            u.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {u.is_active ? 'Attivo' : 'Disattivato'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(u.created_at), "d MMM yyyy", { locale: it })}
                        </td>
                        <td className="px-6 py-4">
                          {u.role !== 'admin' && (
                            <UserActions user={u} />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nessun utente registrato</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
