import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields (email, password, name)' },
        { status: 400 }
      )
    }

    // STEP 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    // STEP 2: Calculate trial end time (48 hours from now)
    const trialUntil = new Date()
    trialUntil.setHours(trialUntil.getHours() + 48)

    // STEP 3: Create user profile in database with TRIAL tier
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name: name,
          email: email,
          tier: 'trial', // Trial tier (not paid yet)
          trial_until: trialUntil.toISOString(),
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Failed to create user profile: ' + profileError.message },
        { status: 400 }
      )
    }

    // STEP 4: Send welcome email (optional)
    try {
      await fetch(process.env.MAILGUN_API_URL || '', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${process.env.MAILGUN_API_KEY}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          from: process.env.MAILGUN_FROM_EMAIL || 'noreply@aimastery.com',
          to: email,
          subject: '🎉 Welcome to AI Mastery! Your 48-Hour Free Trial Starts Now',
          text: `Hi ${name},\n\nYour 48-hour free trial has started! You have full access to:\n- 100+ AI Tips\n- 500+ Prompts\n- 200+ Templates\n\nTrial ends at: ${trialUntil.toLocaleString()}\n\nAfter your trial, choose a plan to continue.\n\nEnjoy!`,
        }),
      })
    } catch (emailError) {
      console.error('Email send failed (non-critical):', emailError)
      // Don't fail the signup if email fails
    }

    // STEP 5: Return success
    return NextResponse.json(
      {
        success: true,
        message: '✅ Trial started! You have 48 hours of full access.',
        user: {
          id: authData.user.id,
          email: email,
          name: name,
          tier: 'trial',
          trial_until: trialUntil.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
