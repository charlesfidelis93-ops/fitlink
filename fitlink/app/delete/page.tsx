'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProfile } from '@/actions'
import { Trash2, AlertTriangle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function DeletePage() {
  const router = useRouter()
  const [step, setStep] = useState<'confirm' | 'final'>('confirm')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmText, setConfirmText] = useState('')

  async function handleDelete() {
    if (confirmText !== 'DELETE') {
      setError('Type DELETE to confirm')
      return
    }

    setLoading(true)
    setError('')

    const result = await deleteProfile()

    if (result.success) {
      router.push('/?deleted=1')
    } else {
      setError(result.error || 'Failed to delete account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 max-w-lg mx-auto px-5 flex flex-col">
      <div className="py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white w-fit"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">Cancel</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-20">
        <div className="bg-red-900/30 rounded-2xl p-5 mb-6 border border-red-800">
          <Trash2 size={36} className="text-red-400" />
        </div>

        <h1 className="text-2xl font-black mb-2 text-center text-red-400">
          Delete Your Account
        </h1>

        {step === 'confirm' && (
          <>
            <p className="text-slate-400 text-center text-sm mb-8 max-w-xs leading-relaxed">
              This will permanently delete your profile, all measurements, and your share link.
              This action cannot be undone.
            </p>

            <div className="w-full space-y-4">
              <div className="bg-red-950 border border-red-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-red-300 mb-1">This will delete:</p>
                    <ul className="text-red-400 space-y-1">
                      <li>• Your measurement profile</li>
                      <li>• All your measurements</li>
                      <li>• Your share link (permanently)</li>
                      <li>• Your account</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('final')}
                className="btn-danger"
              >
                I understand, continue
              </button>

              <Link href="/" className="btn-secondary block text-center">
                Cancel, keep my data
              </Link>
            </div>
          </>
        )}

        {step === 'final' && (
          <>
            <p className="text-slate-400 text-center text-sm mb-8 max-w-xs">
              Type <span className="font-bold text-white">DELETE</span> to permanently erase all your data.
            </p>

            <div className="w-full space-y-4">
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Type DELETE"
                className="w-full bg-slate-800 border-2 border-red-700 rounded-xl px-4 py-4 text-xl font-bold text-white text-center focus:border-red-500 focus:outline-none transition-colors"
                autoCapitalize="characters"
              />

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== 'DELETE'}
                className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting everything...' : 'Permanently Delete My Account'}
              </button>

              <button
                onClick={() => setStep('confirm')}
                className="btn-secondary"
              >
                Go back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
