'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import {
  Home,
  Calendar,
  Heart,
  LayoutDashboard,
  User,
  Plus,
} from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const canCreateEvents = user?.role === 'comunale' || user?.role === 'admin'

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        {/* Calendario */}
        <Link
          href="/calendario"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/calendario') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs mt-1">Calendario</span>
        </Link>

        {/* Create Event Button (for comunale/admin) */}
        {canCreateEvents && (
          <Link
            href="/dashboard/nuovo-evento"
            className="flex items-center justify-center w-14 h-14 -mt-5 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-7 h-7" />
          </Link>
        )}

        {/* Preferiti */}
        <Link
          href={user ? '/preferiti' : '/login'}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/preferiti') ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs mt-1">Preferiti</span>
        </Link>

        {/* Profilo / Dashboard */}
        {user ? (
          <Link
            href={canCreateEvents ? '/dashboard' : '/profilo'}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/dashboard') || isActive('/profilo') ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            {canCreateEvents ? (
              <>
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-xs mt-1">Dashboard</span>
              </>
            ) : (
              <>
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Profilo</span>
              </>
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/login') ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Accedi</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
