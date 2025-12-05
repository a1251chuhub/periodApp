'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'

export default function Page() {
  const router = useRouter()
  const { user, isLoading } = useUserStore()

  useEffect(() => {
    if (!isLoading) {
      if (user?.is_bound) {
        router.push('/period')
      } else if (user) {
        // User exists but not bound
        router.push('/bind')
      }
      // If user is null, LIFFProvider is probably still initializing
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return null
}
