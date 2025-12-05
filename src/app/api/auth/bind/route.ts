import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

// Input validation schema
const bindSchema = z.object({
  phone: z
    .string()
    .regex(/^09\d{8}$/, 'Phone number must be in format 09xxxxxxxx'),
  lineUid: z.string().min(1, 'lineUid is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const validationResult = bindSchema.safeParse(body)
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

    const { phone, lineUid } = validationResult.data

    // TODO: Ragic Integration - Future enhancement
    // This is a temporary simple binding implementation
    // Will be replaced with full Ragic CRM integration later

    // Check if user already exists with this lineUid
    const { data: existingUser, error: fetchError } = await supabase
      .from('app_users')
      .select('*')
      .eq('line_user_id', lineUid)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows found", which is expected for new users
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to check user existence',
        },
        { status: 500 },
      )
    }

    if (existingUser) {
      // User already exists - return success (idempotent operation)
      return NextResponse.json({
        success: true,
        message: 'User already bound',
        data: {
          id: existingUser.id,
          phone: phone, // Return the provided phone number
        },
      })
    }

    // Create new user - Simple binding mode (no Ragic integration)
    // TODO: Ragic Integration - Replace with actual Ragic data lookup
    const { data: newUser, error: insertError } = await supabase
      .from('app_users')
      .insert({
        ragic_id: 0, // Temp value - will be replaced with actual Ragic ID
        ragic_member_id: 'TEMP_USER', // Temp value for NOT NULL constraint
        line_user_id: lineUid,
        // locale, avg_cycle_days, etc. will use defaults from schema
      })
      .select()
      .single()

    if (insertError || !newUser) {
      console.error('Error creating user:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user',
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User bound successfully',
      data: {
        id: newUser.id,
        phone: phone,
      },
    })

  } catch (error) {
    console.error('Unexpected error in bind API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    )
  }
}
