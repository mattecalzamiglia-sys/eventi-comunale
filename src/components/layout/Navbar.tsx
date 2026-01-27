'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { useAuthStore } from '@/stores/auth-store'
import {
  Calendar,
  Bell,
  User,
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard,
  Heart,
  Settings,
  Shield,
} from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuthStore()
  const notificationCount = 0 // TODO: fetch from server or props

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                Eventi Comunali
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Eventi
            </Link>
            <Link
              href="/calendario"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/calendario')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Calendario
            </Link>

            {user && (
              <>
                <Link
                  href="/preferiti"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/preferiti')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="w-5 h-5 inline-block mr-1" />
                  Preferiti
                </Link>

                {/* Dashboard per Comunale */}
                {(user.role === 'comunale' || user.role === 'admin') && (
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/dashboard')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5 inline-block mr-1" />
                    Dashboard
                  </Link>
                )}

                {/* Admin Panel */}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="w-5 h-5 inline-block mr-1" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifiche"
                  className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user.nome}
                    </span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {user.email}
                        <span className="block text-xs capitalize text-gray-400">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        href="/profilo"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mt-1"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Impostazioni</span>
                      </Link>
                      <form action={logout}>
                        <button
                          type="submit"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Esci</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:block">Accedi</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
            >
              Eventi
            </Link>
            <Link
              href="/calendario"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                isActive('/calendario') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
            >
              Calendario
            </Link>

            {user && (
              <>
                <Link
                  href="/preferiti"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive('/preferiti') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Preferiti
                </Link>

                {(user.role === 'comunale' || user.role === 'admin') && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                      pathname.startsWith('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    Dashboard
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                      pathname.startsWith('/admin') ? 'bg-purple-50 text-purple-600' : 'text-gray-600'
                    }`}
                  >
                    Pannello Admin
                  </Link>
                )}

                <Link
                  href="/profilo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600"
                >
                  Impostazioni
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
