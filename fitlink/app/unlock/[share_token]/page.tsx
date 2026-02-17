'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { verifySharePin } from '@/actions'
import { Lock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

export default function UnlockPage({
  params,
}: {
  params: Promise<{ share_token: string }>
}) {
  const { share_token } = use(params)
  const router = useRouter()
  const [pin, setPin] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    if (value && index < 3) {
      inputs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pinStr = pin.join('')
    if (pinStr.length !== 4) {
      setError('Enter your 4-digit PIN')
      return
    }

    setLoading(true)
    setError('')

    const result = await verifySharePin(pinStr, share_token)

    if (result.success) {
      router.push(`/edit/${share_token}`)
    } else {
      setError(result.error || 'Incorrect PIN')
      setPin(['', '', '', ''])
      inputs.current[0]?.focus()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 max-w-lg mx-auto px-5 flex flex-col">
      <div className="py-5">
        <Link
          href={`/m/${share_token}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white w-fit"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">Back to profile</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-20">
        <div className="bg-indigo-900 rounded-2xl p-5 mb-6">
          <Lock size={36} className="text-indigo-300" />
        </div>

        <h1 className="text-2xl font-black mb-2 text-center">Enter Your PIN</h1>
        <p className="text-slate-400 text-center text-sm mb-10 max-w-xs">
          Enter your 4-digit PIN to unlock edit mode for this profile.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col items-center gap-8">
          {/* PIN inputs */}
          <div className="flex gap-4">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-2xl text-center text-2xl font-black text-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-950 border border-red-800 rounded-xl p-3 text-red-300 text-sm text-center w-full">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || pin.join('').length !== 4}
          >
            {loading ? 'Verifying...' : 'Unlock Edit Mode'}
          </button>
        </form>
      </div>
    </div>
  )
}
