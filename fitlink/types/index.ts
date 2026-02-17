export interface User {
  id: string
  phone: string
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  display_name: string
  gender: 'male' | 'female' | 'other'
  share_token: string
  edit_pin_hash: string
  created_at: string
}

export interface Measurements {
  id: string
  profile_id: string
  chest: number | null
  waist: number | null
  hip: number | null
  shoulder: number | null
  neck: number | null
  arm: number | null
  thigh: number | null
  inseam: number | null
  height: number | null
  fit_preference: 'slim' | 'regular' | 'relaxed' | null
  notes: string | null
  updated_at: string
}

export interface PublicProfile {
  id: string
  display_name: string
  gender: string
  created_at: string
}

export interface PublicMeasurements {
  chest: number | null
  waist: number | null
  hip: number | null
  shoulder: number | null
  neck: number | null
  arm: number | null
  thigh: number | null
  inseam: number | null
  height: number | null
  fit_preference: string | null
  notes: string | null
  updated_at: string
}

export interface CreateProfileInput {
  display_name: string
  gender: 'male' | 'female' | 'other'
  pin: string
  phone: string
}

export interface MeasurementInput {
  chest?: number
  waist?: number
  hip?: number
  shoulder?: number
  neck?: number
  arm?: number
  thigh?: number
  inseam?: number
  height?: number
  fit_preference?: 'slim' | 'regular' | 'relaxed'
  notes?: string
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
