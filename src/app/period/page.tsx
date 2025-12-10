'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useUserStore } from '@/stores/userStore'

interface PeriodLog {
  id: string
  start_date: string
  end_date: string | null
  flow_level: string | null
  symptoms: any
}

export default function PeriodPage() {
  const router = useRouter()
  const { user, isLoading } = useUserStore()

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [history, setHistory] = useState<PeriodLog[]>([])
  const [nextPeriodPrediction, setNextPeriodPrediction] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Redirect if user is not bound
  useEffect(() => {
    if (!isLoading && (!user || !user.is_bound)) {
      router.push('/bind')
      return
    }

    if (user?.is_bound) {
      loadHistory()
    }
  }, [user, isLoading, router])

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true)

      if (!user) {
        console.error('No user available')
        return
      }

      const response = await fetch('/api/history', {
        headers: {
          'X-Line-User-Id': user.line_user_id,
        },
      })
      const data = await response.json()

      if (data.success) {
        setHistory(data.data.history)
        setNextPeriodPrediction(data.data.nextPeriodPrediction)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess(false)

    if (!startDate) {
      setSubmitError('請選擇有效日期')
      return
    }

    if (!user) {
      setSubmitError('發生錯誤')
      return
    }

    setIsSubmitting(true)

    try {
      const requestData: any = {
        start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      }

      if (endDate) {
        requestData.end_date = endDate.toISOString().split('T')[0]
      }

      const response = await fetch('/api/period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-User-Id': user.line_user_id,
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitSuccess(true)
        setStartDate(null)
        setEndDate(null)

        // Reload history to reflect changes
        await loadHistory()

        // Clear success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000)
      } else {
        setSubmitError(data.error || '儲存失敗，請稍後再試')
      }
    } catch (error) {
      setSubmitError('儲存失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  if (isLoading || !user?.is_bound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">經期記錄</h1>
          {nextPeriodPrediction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                下次經期預計: {formatDate(nextPeriodPrediction)}
              </p>
            </div>
          )}
        </div>

        {/* Add new record form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">新增經期記錄</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日期
                </label>
                <div className="relative">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy/MM/dd"
                    placeholderText="選擇日期"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    maxDate={new Date()}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  結束日期 (選填)
                </label>
                <div className="relative">
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy/MM/dd"
                    placeholderText="選擇日期"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    minDate={startDate || undefined}
                    maxDate={new Date()}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {submitSuccess && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">記錄新增成功</div>
              </div>
            )}

            {submitError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{submitError}</div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '儲存中...' : '儲存'}
              </button>
            </div>
          </form>
        </div>

        {/* History section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">歷史記錄</h2>

          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">尚未有記錄</p>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(record.start_date)} - {record.end_date ? formatDate(record.end_date) : '進行中'}
                      </p>
                      {record.flow_level && (
                        <p className="text-sm text-gray-600">流量: {record.flow_level}</p>
                      )}
                    </div>
                    {record.symptoms && (
                      <div className="text-sm text-gray-600">
                        症狀: {Object.keys(record.symptoms).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
