import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { CycleService } from '@/services/CycleService'

// Input validation schema
const periodSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'start_date must be in ISO format YYYY-MM-DD'),
})

export async function POST(request: NextRequest) {
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

    // Extract line_user_id from Authorization header (Bearer token or direct)
    // For simplicity, we'll use the header value as line_user_id
    // In production, this should be a proper JWT token validation
    let lineUserId = authHeader

    // Handle Bearer token format
    if (authHeader.startsWith('Bearer ')) {
      lineUserId = authHeader.substring(7)
    }

    // Get the user ID from our app_users table
    const { data: appUser, error: userError } = await supabase
      .from('app_users')
      .select('id')
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

    // Parse request body
    const body = await request.json()

    // Validate input
    const validationResult = periodSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 },
      )
    }

    const { start_date } = validationResult.data

    // Insert new period log
    const { data: newPeriod, error: insertError } = await supabase
      .from('period_logs')
      .insert({
        user_id: appUser.id,
        start_date: start_date,
      })
      .select()
      .single()

    if (insertError || !newPeriod) {
      console.error('Error inserting period log:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save period record',
        },
        { status: 500 },
      )
    }

    // Get user's complete period history (including the new one we just added)
    const { data: history, error: historyError } = await supabase
      .from('period_logs')
      .select('start_date')
      .eq('user_id', appUser.id)
      .order('start_date', { ascending: true })

    if (historyError) {
      console.error('Error fetching period history:', historyError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve period history',
        },
        { status: 500 },
      )
    }

    // Calculate prediction using CycleService
    const historyDates = history.map(record => record.start_date)
    const predictedDate = CycleService.calculateNextPeriod(historyDates)

    // Update app_users with average cycle days (calculated from weighted average)
    let avgCycleDays = 28 // Default

    if (historyDates.length >= 2) {
      // Calculate cycle lengths to get weighted average for avg_cycle_days
      const cycleLengths: number[] = []
      for (let i = 1; i < historyDates.length; i++) {
        const cycleLength = Math.round(
          (new Date(historyDates[i]).getTime() - new Date(historyDates[i - 1]).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        cycleLengths.push(cycleLength)
      }

      // Filter valid cycles and calculate weighted average if we have data
      const validCycles = cycleLengths.filter(cycle => cycle >= 21 && cycle <= 45)
      if (validCycles.length > 0) {
        if (validCycles.length >= 3) {
          // Use weighted average of last 3 cycles
          const lastThree = validCycles.slice(-3)
          avgCycleDays = Math.round(
            (lastThree[2] * 0.5) + (lastThree[1] * 0.3) + (lastThree[0] * 0.2)
          )
        } else {
          // Simple average for fewer cycles
          avgCycleDays = Math.round(
            validCycles.reduce((sum, cycle) => sum + cycle, 0) / validCycles.length
          )
        }
      }
    }

    // Update user's average cycle days
    const { error: updateError } = await supabase
      .from('app_users')
      .update({
        avg_cycle_days: avgCycleDays,
      })
      .eq('id', appUser.id)

    if (updateError) {
      console.error('Error updating user cycle average:', updateError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Period record saved successfully',
      data: {
        id: newPeriod.id,
        start_date: newPeriod.start_date,
        predicted_next_date: predictedDate,
        avg_cycle_days: avgCycleDays,
      },
    })

  } catch (error) {
    console.error('Unexpected error in period API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    )
  }
}
