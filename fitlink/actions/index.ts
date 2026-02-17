'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  generateShareToken,
  validateShareToken,
  hashPin,
  verifyPin,
  validatePin,
  sanitizeText,
  sanitizeMeasurement,
  checkRateLimit,
} from '@/lib/security'
import type { ActionResult, MeasurementInput, CreateProfileInput } from '@/types'

// ============================================
// CREATE PROFILE
// ============================================

export async function createProfile(
  formData: FormData
): Promise<ActionResult<{ share_token: string }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const display_name = sanitizeText(formData.get('display_name') as string, 60)
  const gender = formData.get('gender') as string
  const pin = formData.get('pin') as string

  if (!display_name || display_name.length < 2) {
    return { success: false, error: 'Name must be at least 2 characters' }
  }

  if (!['male', 'female', 'other'].includes(gender)) {
    return { success: false, error: 'Invalid gender selection' }
  }

  if (!validatePin(pin)) {
    return { success: false, error: 'PIN must be exactly 4 digits' }
  }

  // Check if user already has a profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, share_token')
    .eq('user_id', user.id)
    .single()

  if (existingProfile) {
    return {
      success: true,
      data: { share_token: existingProfile.share_token },
    }
  }

  const share_token = generateShareToken()
  const edit_pin_hash = await hashPin(pin)

  const serviceClient = createServiceClient()

  // Ensure user exists in users table
  await serviceClient.from('users').upsert({
    id: user.id,
    phone: user.phone ?? '',
  }, { onConflict: 'id' })

  const { data: profile, error } = await serviceClient
    .from('profiles')
    .insert({
      user_id: user.id,
      display_name,
      gender,
      share_token,
      edit_pin_hash,
    })
    .select('share_token')
    .single()

  if (error || !profile) {
    return { success: false, error: 'Failed to create profile' }
  }

  // Create empty measurements row
  await serviceClient.from('measurements').insert({
    profile_id: (await serviceClient
      .from('profiles')
      .select('id')
      .eq('share_token', share_token)
      .single()).data!.id,
  })

  return { success: true, data: { share_token: profile.share_token } }
}

// ============================================
// SAVE MEASUREMENTS (authenticated owner)
// ============================================

export async function saveMeasurements(
  formData: FormData,
  share_token: string
): Promise<ActionResult> {
  if (!validateShareToken(share_token)) {
    return { success: false, error: 'Invalid share token' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('share_token', share_token)
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profile not found' }

  const measurements: MeasurementInput = {
    chest: sanitizeMeasurement(formData.get('chest')) ?? undefined,
    waist: sanitizeMeasurement(formData.get('waist')) ?? undefined,
    hip: sanitizeMeasurement(formData.get('hip')) ?? undefined,
    shoulder: sanitizeMeasurement(formData.get('shoulder')) ?? undefined,
    neck: sanitizeMeasurement(formData.get('neck')) ?? undefined,
    arm: sanitizeMeasurement(formData.get('arm')) ?? undefined,
    thigh: sanitizeMeasurement(formData.get('thigh')) ?? undefined,
    inseam: sanitizeMeasurement(formData.get('inseam')) ?? undefined,
    height: sanitizeMeasurement(formData.get('height')) ?? undefined,
    fit_preference: (formData.get('fit_preference') as 'slim' | 'regular' | 'relaxed') || undefined,
    notes: sanitizeText(formData.get('notes') as string || '', 500) || undefined,
  }

  const { error } = await supabase
    .from('measurements')
    .update(measurements)
    .eq('profile_id', profile.id)

  if (error) return { success: false, error: 'Failed to save measurements' }

  revalidatePath(`/m/${share_token}`)
  return { success: true }
}

// ============================================
// VERIFY PIN
// ============================================

export async function verifySharePin(
  pin: string,
  share_token: string
): Promise<ActionResult> {
  if (!validateShareToken(share_token)) {
    return { success: false, error: 'Invalid token' }
  }

  if (!validatePin(pin)) {
    return { success: false, error: 'Invalid PIN format' }
  }

  // Rate limit: 5 attempts per 15 minutes per token
  const rateLimitKey = `pin:${share_token}`
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)

  if (!rateCheck.allowed) {
    const waitMins = Math.ceil((rateCheck.resetAt - Date.now()) / 60000)
    return {
      success: false,
      error: `Too many attempts. Try again in ${waitMins} minute(s).`,
    }
  }

  const serviceClient = createServiceClient()

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('edit_pin_hash')
    .eq('share_token', share_token)
    .single()

  if (!profile) return { success: false, error: 'Profile not found' }

  const isValid = await verifyPin(pin, profile.edit_pin_hash)

  if (!isValid) {
    return { success: false, error: 'Incorrect PIN' }
  }

  // Store PIN session in cookie (1 hour)
  const cookieStore = await cookies()
  cookieStore.set(`edit_session_${share_token}`, 'authorized', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
  })

  return { success: true }
}

// ============================================
// UPDATE MEASUREMENTS (PIN-verified edit)
// ============================================

export async function updateMeasurementsWithPin(
  formData: FormData,
  share_token: string
): Promise<ActionResult> {
  if (!validateShareToken(share_token)) {
    return { success: false, error: 'Invalid token' }
  }

  // Verify edit session cookie
  const cookieStore = await cookies()
  const editSession = cookieStore.get(`edit_session_${share_token}`)

  if (!editSession || editSession.value !== 'authorized') {
    return { success: false, error: 'Edit session expired. Please re-enter PIN.' }
  }

  const serviceClient = createServiceClient()

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('share_token', share_token)
    .single()

  if (!profile) return { success: false, error: 'Profile not found' }

  const measurements: MeasurementInput = {
    chest: sanitizeMeasurement(formData.get('chest')) ?? undefined,
    waist: sanitizeMeasurement(formData.get('waist')) ?? undefined,
    hip: sanitizeMeasurement(formData.get('hip')) ?? undefined,
    shoulder: sanitizeMeasurement(formData.get('shoulder')) ?? undefined,
    neck: sanitizeMeasurement(formData.get('neck')) ?? undefined,
    arm: sanitizeMeasurement(formData.get('arm')) ?? undefined,
    thigh: sanitizeMeasurement(formData.get('thigh')) ?? undefined,
    inseam: sanitizeMeasurement(formData.get('inseam')) ?? undefined,
    height: sanitizeMeasurement(formData.get('height')) ?? undefined,
    fit_preference: (formData.get('fit_preference') as 'slim' | 'regular' | 'relaxed') || undefined,
    notes: sanitizeText(formData.get('notes') as string || '', 500) || undefined,
  }

  const { error } = await serviceClient
    .from('measurements')
    .update(measurements)
    .eq('profile_id', profile.id)

  if (error) return { success: false, error: 'Failed to update measurements' }

  revalidatePath(`/m/${share_token}`)
  return { success: true }
}

// ============================================
// DELETE PROFILE
// ============================================

export async function deleteProfile(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const serviceClient = createServiceClient()

  // Delete cascades to profiles + measurements via FK
  const { error } = await serviceClient
    .from('users')
    .delete()
    .eq('id', user.id)

  if (error) return { success: false, error: 'Failed to delete account' }

  await supabase.auth.signOut()
  return { success: true }
}

// ============================================
// GET PUBLIC PROFILE (server-side, no auth)
// ============================================

export async function getPublicProfile(share_token: string) {
  if (!validateShareToken(share_token)) return null

  const serviceClient = createServiceClient()

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('id, display_name, gender, created_at')
    .eq('share_token', share_token)
    .single()

  if (!profile) return null

  const { data: measurements } = await serviceClient
    .from('measurements')
    .select('*')
    .eq('profile_id', profile.id)
    .single()

  return { profile, measurements }
}
