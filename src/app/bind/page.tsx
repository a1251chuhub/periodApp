'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'

export default function BindPage() {
  const router = useRouter()
  const { user } = useUserStore()

  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already bound
  if (user?.is_bound) {
    router.push('/period')
    return null
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^09\d{8}$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePhone(phone)) {
      setError('請輸入有效的手機號碼')
      return
    }

    if (!user?.line_user_id) {
      setError('綁定失敗，請稍後再試')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/bind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          lineUid: user.line_user_id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update user store
        useUserStore.getState().updateUserFields({
          phone,
          is_bound: true,
        })

        // Redirect to main page
        router.push('/period')
      } else {
        setError(data.error || '綁定失敗，請稍後再試')
      }
    } catch (error) {
      setError('綁定失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          綁定手機
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          請輸入您的手機號碼以完成綁定
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                手機號碼
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="請輸入手機號碼 (09xxxxxxxx)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '綁定中...' : '綁定'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
