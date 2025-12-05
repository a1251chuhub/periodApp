import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CycleService } from '@/services/CycleService'

// Mock authentication - should be replaced with proper auth
function getCurrentUserId(): string | null {
  // In production, this should extract user ID from auth headers/tokens
  // For now, we'll assume the user ID is passed somehow
  return null
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement proper authentication
    const userId = getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user settings
    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    // Get period log history
    const { data: historyData, error: historyError } = await supabase
      .from('period_logs')
      .select('start_date, end_date, flow_level, symptoms')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })

    if (historyError) {
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    // Calculate prediction using CycleService
    let nextPeriodPrediction = null
    if (historyData && historyData.length > 0) {
      const dates = historyData.map(log => log.start_date)
      nextPeriodPrediction = CycleService.calculateNextPeriod(dates)
    }

    return NextResponse.json({
      success: true,
      data: {
        history: historyData || [],
        nextPeriodPrediction
      }
    })

  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
