'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Handle workStore errors by refreshing the router
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('workStore')) {
        console.warn('WorkStore error detected, refreshing router...')
        router.refresh()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('workStore')) {
        console.warn('WorkStore promise rejection detected, refreshing router...')
        router.refresh()
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [router])

  return <>{children}</>
}