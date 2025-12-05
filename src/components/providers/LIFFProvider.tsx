'use client'

import { useEffect, ReactNode } from 'react'
import liff from '@line/liff'
import { useUserStore } from '@/stores/userStore'
import { supabase } from '@/lib/supabase'

interface LIFFProviderProps {
  children: ReactNode
}

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || 'your-liff-id'

export function LIFFProvider({ children }: LIFFProviderProps) {
  const { setUser, setLoading, setError } = useUserStore()

  useEffect(() => {
    initializeLIFF()
  }, [])

  const initializeLIFF = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we're in LINE environment
      const isInLineApp = navigator.userAgent.includes('Line/')

      if (isInLineApp && LIFF_ID !== 'your-liff-id') {
        // Production: Initialize real LIFF SDK
        await liff.init({ liffId: LIFF_ID })

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile()
          const lineUserId = profile.userId

          // Load user data from Supabase
          await loadUserFromSupabase(lineUserId)
        } else {
          // Handle login if not logged in
          await liff.login()
        }
      } else {
        // Development: Use mock user ID
        console.log('Development mode: Using mock LINE user ID')
        const mockLineUserId = 'dev-mock-user-' + Date.now()
        await loadUserFromSupabase(mockLineUserId)
      }
    } catch (error) {
      console.error('LIFF initialization failed:', error)
      setError('LIFF 初始化失敗，請重新整理頁面')
    } finally {
      setLoading(false)
    }
  }

  const loadUserFromSupabase = async (lineUserId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('line_user_id', lineUserId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      if (userData) {
        setUser({
          ...userData,
          is_bound: true,
          next_period_date: userData.next_period_date
        })
      } else {
        // New user
        setUser({
          id: '',
          line_user_id: lineUserId,
          ragic_id: 0,
          ragic_member_id: null,
          locale: 'zh-TW',
          avg_cycle_days: 28,
          avg_period_days: 5,
          luteal_phase_days: 14,
          is_bound: false
        })
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      setError('用戶資料載入失敗')
    }
  }

  return <>{children}</>
}
