'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

export default function PWAUpdater() {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')

        // Check for updates periodically (every 60 seconds)
        setInterval(() => {
          registration.update()
        }, 60 * 1000)

        // If there's already a waiting worker, show the update banner
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowUpdateBanner(true)
        }

        // Listen for new service workers
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            // When the new worker is installed and waiting
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker)
              setShowUpdateBanner(true)
            }
          })
        })

        // Handle controller change (when new SW takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })

      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }

    registerSW()
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage('skipWaiting')
    }
  }

  const handleDismiss = () => {
    setShowUpdateBanner(false)
  }

  if (!showUpdateBanner) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">
            Nuova versione disponibile!
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpdate}
            className="px-4 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Aggiorna
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
