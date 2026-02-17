'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createProfile } from '@/actions'
import { Ruler, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type Step = 'phone' | 'otp' | 'profile'

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanPhone = phone.replace(/\s/g, '')
    if (!cleanPhone.startsWith('+') || cleanPhone.length < 8) {
      setError('Enter phone with country code (e.g. +2348001234567)')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: cleanPhone,
    })

    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
    }
    setLoading(false)
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.verifyOtp({
      phone: phone.replace(/\s/g, ''),
      token: otp,
      type: 'sms',
    })

    if (error) {
      setError('Invalid code. Please try again.')
    } else {
      setStep('profile')
    }
    setLoading(false)
  }

  async function handleCreateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const pin = formData.get('pin') as string
    const confirmPin = formData.get('confirm_pin') as string

    if (pin !== confirmPin) {
      setError('PINs do not match')
      setLoading(false)
      return
    }

    const result = await createProfile(formData)

    if (result.success && result.data) {
      router.push(`/measurements?token=${result.data.share_token}`)
    } else {
      setError(result.error || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col max-w-lg mx-auto px-5">
      {/* Header */}
      <div className="py-5 flex items-center gap-3">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <Ruler className="text-indigo-400" size={20} />
          <span className="font-bold">FitLink</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {(['phone', 'otp', 'profile'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              (['phone', 'otp', 'profile'].indexOf(step) >= i)
                ? 'bg-indigo-500'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* STEP 1: Phone */}
      {step === 'phone' && (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-black mb-2">Enter your phone</h1>
            <p className="text-slate-400">
              We'll send a one-time code to verify it's you.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+2348001234567"
              className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-4 text-xl font-semibold text-white focus:border-indigo-500 focus:outline-none transition-colors"
              required
              autoComplete="tel"
            />
            <p className="text-slate-500 text-sm mt-2">
              Include your country code (e.g. +234 for Nigeria)
            </p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {/* STEP 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-black mb-2">Enter the code</h1>
            <p className="text-slate-400">
              Sent to {phone}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">
              Verification Code
            </label>
            <input
              type="number"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="measurement-input"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="btn-secondary"
          >
            Back
          </button>
        </form>
      )}

      {/* STEP 3: Profile */}
      {step === 'profile' && (
        <form onSubmit={handleCreateProfile} className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-black mb-2">Create your profile</h1>
            <p className="text-slate-400">
              This will be visible to tailors you share with.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">
              Your Name
            </label>
            <input
              name="display_name"
              type="text"
              placeholder="e.g. Tunde Adeyemi"
              className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-4 text-xl font-semibold text-white focus:border-indigo-500 focus:outline-none transition-colors"
              required
              minLength={2}
              maxLength={60}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">
              Gender
            </label>
            <select
              name="gender"
              className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-4 text-lg font-semibold text-white focus:border-indigo-500 focus:outline-none transition-colors"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">
              4-Digit PIN (to edit measurements)
            </label>
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              minLength={4}
              placeholder="----"
              className="measurement-input"
              required
              pattern="\d{4}"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">
              Confirm PIN
            </label>
            <input
              name="confirm_pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              minLength={4}
              placeholder="----"
              className="measurement-input"
              required
              pattern="\d{4}"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating profile...' : 'Create Profile →'}
          </button>
        </form>
      )}
    </div>
  )
}
