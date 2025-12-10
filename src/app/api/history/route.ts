import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CycleService } from '@/services/CycleService'

export async function GET(request: NextRequest) {
  try {
    // Auth guard: Check for Authorization header (or X-Line-User-Id)
    const authHeader = request.headers.get('Authorization') || request.headers.get('X-Line-User-Id')

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please provide Authorization header or X-Line-User-Id.',
        },
        { status: 401 }
      )
    }

    // Extract line_user_id from Authorization header
    let lineUserId = authHeader

    // Handle Bearer token format
    if (authHeader.startsWith('Bearer ')) {
      lineUserId = authHeader.substring(7)
    }

    // Get the user ID from our app_users table
    const { data: appUser, error: userError } = await supabase
      .from('app_users')
      .select('id, avg_cycle_days, avg_period_days')
      .eq('line_user_id', lineUserId)
      .single()

    if (userError || !appUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found. Please bind your account first.',
        },
        { status: 404 }
      )
    }

    // Get period log history
    const { data: historyData, error: historyError } = await supabase
      .from('period_logs')
      .select('id, start_date, end_date, flow_level, symptoms')
      .eq('user_id', appUser.id)
      .order('start_date', { ascending: false })

    if (historyError) {
      console.error('Failed to fetch history:', historyError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch history'
        },
        { status: 500 }
      )
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
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
